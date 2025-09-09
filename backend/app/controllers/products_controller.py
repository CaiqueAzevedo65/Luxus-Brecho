from flask import request, jsonify, current_app
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from typing import Any, Dict
import time

from ..models.product_model import (
    get_collection,
    prepare_new_product,
    validate_product,
    normalize_product,
)
from ..services.supabase_storage import storage_service


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    d = dict(doc)
    d.pop("_id", None)
    return d


def list_products():
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503

    coll = get_collection(db)

    categoria = request.args.get("categoria")
    q = request.args.get("q")
    page = max(int(request.args.get("page", 1) or 1), 1)
    page_size = min(max(int(request.args.get("page_size", 10) or 10), 1), 100)

    query: Dict[str, Any] = {}
    if categoria:
        query["categoria"] = categoria
    if q:
        query["$text"] = {"$search": q}

    cursor = coll.find(query)

    if q:
        cursor = cursor.sort([("score", {"$meta": "textScore"})])

    total = coll.count_documents(query)

    items = [
        _serialize(doc) for doc in cursor.skip((page - 1) * page_size).limit(page_size)
    ]

    return jsonify(
        items=items,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
        },
    )


def get_product(id: int):
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    doc = coll.find_one({"id": int(id)})
    if not doc:
        return jsonify(message="not found"), 404
    return jsonify(_serialize(doc))


def create_product():
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    payload = request.get_json(silent=True) or {}
    ok, errors, doc = prepare_new_product(db, payload)
    if not ok:
        return jsonify(message="validation error", errors=errors), 400

    try:
        coll.insert_one(doc)
    except DuplicateKeyError:
        return jsonify(message="id already exists"), 409

    return jsonify(_serialize(doc)), 201


def update_product(id: int):
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    current = coll.find_one({"id": int(id)})
    if not current:
        return jsonify(message="not found"), 404

    payload = request.get_json(silent=True) or {}
    # Merge parcial
    merged = dict(current)
    merged.pop("_id", None)
    merged.update(payload)
    merged = normalize_product(merged)

    ok, errors = validate_product(merged, db)  # Passa db para validação dinâmica
    if not ok:
        return jsonify(message="validation error", errors=errors), 400

    # Não permitir troca de id
    merged["id"] = current["id"]

    coll.update_one({"id": int(id)}, {"$set": merged})
    updated = coll.find_one({"id": int(id)})
    return jsonify(_serialize(updated))


def delete_product(id: int):
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    res = coll.delete_one({"id": int(id)})
    if res.deleted_count == 0:
        return jsonify(message="not found"), 404
    return jsonify(message="deleted"), 200


def create_product_with_image():
    """
    Cria produto com upload de imagem
    POST /api/products/with-image
    
    Form Data:
    - titulo, descricao, preco, categoria: dados do produto
    - image: arquivo de imagem
    """
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    
    try:
        # Valida se há imagem
        if 'image' not in request.files:
            return jsonify(message="Imagem é obrigatória"), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify(message="Nenhuma imagem selecionada"), 400
        
        # Obtém dados do produto do form
        form_data = {
            "titulo": request.form.get('titulo'),
            "descricao": request.form.get('descricao'),
            "preco": request.form.get('preco'),
            "categoria": request.form.get('categoria')
        }
        
        # Validação básica
        if not all([form_data['titulo'], form_data['descricao'], 
                   form_data['preco'], form_data['categoria']]):
            return jsonify(message="Todos os campos são obrigatórios"), 400
        
        # Converte preço
        try:
            form_data['preco'] = float(form_data['preco'])
        except ValueError:
            return jsonify(message="Preço deve ser um número válido"), 400
        
        # Primeiro faz upload da imagem para obter URL
        # Usa um ID temporário para o upload
        temp_id = int(time.time() * 1000)  # Timestamp como ID temporário
        success, result = storage_service.upload_image(file, temp_id)
        
        if not success:
            return jsonify(message=f"Erro no upload da imagem: {result}"), 400
        
        # Adiciona URL da imagem aos dados do produto
        form_data['imagem'] = result
        
        # Agora prepara produto com todos os dados (incluindo imagem)
        coll = get_collection(db)
        ok, errors, product_doc = prepare_new_product(db, form_data)
        if not ok:
            # Se falhar na validação, remove a imagem já enviada
            storage_service.delete_image(result)
            return jsonify(message="validation error", errors=errors), 400
        
        # Renomeia arquivo para usar o ID real do produto
        product_id = product_doc['id']
        if temp_id != product_id:
            # Upload novamente com ID correto
            file.stream.seek(0)  # Reset do stream do arquivo
            success_final, final_url = storage_service.upload_image(file, product_id)
            if success_final:
                # Remove arquivo temporário e usa novo URL
                storage_service.delete_image(result)
                product_doc['imagem'] = final_url
            # Se falhar o re-upload, mantém o temporário mas funciona
        
        # Insere produto no banco
        try:
            coll.insert_one(product_doc)
        except DuplicateKeyError:
            # Se falhar, tenta deletar a imagem que foi enviada
            storage_service.delete_image(result)
            return jsonify(message="ID já existe"), 409
        
        return jsonify({
            "message": "Produto criado com sucesso",
            "product": _serialize(product_doc)
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Erro ao criar produto com imagem: {e}")
        return jsonify(message="Erro interno no servidor"), 500


def update_product_image(id: int):
    """
    Atualiza apenas a imagem de um produto
    PUT /api/products/<id>/image
    
    Form Data:
    - image: novo arquivo de imagem
    """
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    
    coll = get_collection(db)
    
    # Verifica se produto existe
    current_product = coll.find_one({"id": int(id)})
    if not current_product:
        return jsonify(message="Produto não encontrado"), 404
    
    # Valida se há nova imagem
    if 'image' not in request.files:
        return jsonify(message="Nova imagem é obrigatória"), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify(message="Nenhuma imagem selecionada"), 400
    
    try:
        # Faz upload da nova imagem
        success, result = storage_service.upload_image(file, id)
        
        if not success:
            return jsonify(message=f"Erro no upload: {result}"), 400
        
        # Deleta imagem antiga se existir
        old_image_url = current_product.get('imagem')
        if old_image_url and old_image_url.startswith('http'):
            storage_service.delete_image(old_image_url)
        
        # Atualiza produto com nova URL
        coll.update_one(
            {"id": int(id)}, 
            {"$set": {"imagem": result}}
        )
        
        # Retorna produto atualizado
        updated_product = coll.find_one({"id": int(id)})
        return jsonify({
            "message": "Imagem atualizada com sucesso",
            "product": _serialize(updated_product)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao atualizar imagem: {e}")
        return jsonify(message="Erro interno no servidor"), 500


def get_products_by_category(categoria: str):
    """Busca produtos por categoria específica."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503

    coll = get_collection(db)
    
    page = max(int(request.args.get("page", 1) or 1), 1)
    page_size = min(max(int(request.args.get("page_size", 20) or 20), 1), 100)

    query = {"categoria": categoria}
    cursor = coll.find(query).sort("titulo", 1)
    total = coll.count_documents(query)

    items = [
        _serialize(doc) for doc in cursor.skip((page - 1) * page_size).limit(page_size)
    ]

    if not items:
        return jsonify(message="no products found for this category"), 404

    return jsonify(
        items=items,
        categoria=categoria,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
        },
    )
