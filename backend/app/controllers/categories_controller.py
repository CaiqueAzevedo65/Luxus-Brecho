from flask import request, jsonify, current_app
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from typing import Any, Dict

from ..models.category_model import (
    get_collection,
    prepare_new_category,
    validate_category,
    normalize_category,
    seed_default_categories,
)


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Remove campos internos do MongoDB do documento."""
    if not doc:
        return {}
    d = dict(doc)
    d.pop("_id", None)
    return d


def list_categories():
    """Lista todas as categorias com filtros opcionais."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503

    coll = get_collection(db)

    # Filtro por status ativo
    active_only = request.args.get("active_only", "false").lower() == "true"
    page = max(int(request.args.get("page", 1) or 1), 1)
    page_size = min(max(int(request.args.get("page_size", 10) or 10), 1), 100)

    query: Dict[str, Any] = {}
    if active_only:
        query["active"] = True

    cursor = coll.find(query).sort("name", 1)
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


def get_category(id: int):
    """Busca uma categoria específica por ID."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    doc = coll.find_one({"id": int(id)})
    if not doc:
        return jsonify(message="category not found"), 404
    return jsonify(_serialize(doc))


def create_category():
    """Cria uma nova categoria."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    payload = request.get_json(silent=True) or {}
    ok, errors, doc = prepare_new_category(db, payload)
    if not ok:
        return jsonify(message="validation error", errors=errors), 400

    try:
        # Verificar se nome já existe
        existing = coll.find_one({"name": doc["name"]})
        if existing:
            return jsonify(message="category name already exists"), 409
            
        coll.insert_one(doc)
    except DuplicateKeyError:
        return jsonify(message="category id already exists"), 409

    return jsonify(_serialize(doc)), 201


def update_category(id: int):
    """Atualiza uma categoria existente."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    current = coll.find_one({"id": int(id)})
    if not current:
        return jsonify(message="category not found"), 404

    payload = request.get_json(silent=True) or {}
    # Merge parcial
    merged = dict(current)
    merged.pop("_id", None)
    merged.update(payload)
    merged = normalize_category(merged)

    ok, errors = validate_category(merged)
    if not ok:
        return jsonify(message="validation error", errors=errors), 400

    # Não permitir troca de id
    merged["id"] = current["id"]

    # Verificar se nome já existe (em outra categoria)
    if "name" in payload and payload["name"] != current["name"]:
        existing = coll.find_one({"name": merged["name"], "id": {"$ne": int(id)}})
        if existing:
            return jsonify(message="category name already exists"), 409

    coll.update_one({"id": int(id)}, {"$set": merged})
    updated = coll.find_one({"id": int(id)})
    return jsonify(_serialize(updated))


def delete_category(id: int):
    """Remove uma categoria (soft delete - marca como inativa)."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    category = coll.find_one({"id": int(id)})
    if not category:
        return jsonify(message="category not found"), 404

    # Verificar se há produtos usando esta categoria
    products_coll = db["products"]
    products_using_category = products_coll.count_documents({"categoria": category["name"]})
    
    if products_using_category > 0:
        return jsonify(
            message="cannot delete category with associated products",
            products_count=products_using_category
        ), 400

    # Soft delete - marca como inativa
    coll.update_one({"id": int(id)}, {"$set": {"active": False}})
    return jsonify(message="category deactivated"), 200


def activate_category(id: int):
    """Reativa uma categoria inativa."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    coll = get_collection(db)

    category = coll.find_one({"id": int(id)})
    if not category:
        return jsonify(message="category not found"), 404

    coll.update_one({"id": int(id)}, {"$set": {"active": True}})
    updated = coll.find_one({"id": int(id)})
    return jsonify(_serialize(updated))


def seed_categories():
    """Endpoint para criar as categorias padrão."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503

    success = seed_default_categories(db)
    if success:
        return jsonify(message="default categories seeded successfully"), 201
    else:
        return jsonify(message="failed to seed default categories"), 500


def get_categories_summary():
    """Retorna resumo das categorias para uso em outros endpoints."""
    db = current_app.db
    if db is None:
        return jsonify(message="database unavailable"), 503
    
    coll = get_collection(db)
    
    # Busca apenas categorias ativas
    active_categories = list(coll.find(
        {"active": True}, 
        {"_id": 0, "id": 1, "name": 1, "description": 1}
    ).sort("name", 1))
    
    return jsonify(active_categories)
