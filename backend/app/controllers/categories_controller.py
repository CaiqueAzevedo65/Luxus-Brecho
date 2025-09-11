# python
# File: backend/app/controllers/categories_controller.py
from flask import request, jsonify, current_app
from typing import Any, Dict

from app.models.category_model import (
    get_collection,
    prepare_new_category,
    normalize_category,
    validate_category
)

def _get_db():
    """Retorna o DB disponível (request.db > app.db) ou None."""
    db = getattr(request, "db", None)
    if db is None and hasattr(request, "app"):
        db = getattr(request.app, "db", None)
    return db

def _get_store():
    """Retorna dict para armazenar categorias em memória durante testes."""
    app = current_app._get_current_object()  # Get actual app instance
    if not hasattr(app, "_categories_store"):
        print("DEBUG: Initializing new categories store")
        app._categories_store = {}
    return app._categories_store

def list_categories():
    """Lista todas as categorias."""
    db = _get_db()
    if db is None:
        store = _get_store()
        return jsonify(list(store.values())), 200
    
    coll = get_collection(db)
    categories = list(coll.find({}, {"_id": 0}))
    return jsonify(categories), 200

def get_category(id: int):
    """Retorna uma categoria específica por ID."""
    db = _get_db()
    if db is None:
        store = _get_store()
        category = store.get(str(id))
        if not category:
            return jsonify({"error": "Categoria não encontrada"}), 404
        return jsonify(category), 200

    coll = get_collection(db)
    category = coll.find_one({"id": id}, {"_id": 0})
    if not category:
        return jsonify({"error": "Categoria não encontrada"}), 404
    return jsonify(category), 200

def create_category():
    """Cria uma nova categoria."""
    payload = request.get_json(silent=True) or {}
    data = normalize_category(payload)
    ok, errors = validate_category(data)
    if not ok:
        return jsonify({"errors": errors}), 400

    db = _get_db()
    if db is None:
        store = _get_store()
        if "id" in data:
            data["id"] = int(data["id"])
        else:
            existing_ids = [0]
            try:
                existing_ids.extend(int(k) for k in store.keys())
            except ValueError:
                pass
            data["id"] = max(existing_ids) + 1

        str_id = str(data["id"])
        if str_id in store:
            return jsonify({"error": "ID já existe"}), 409

        if "ativo" not in data:
            data["ativo"] = True

        if "descricao" not in data:
            data["descricao"] = data.get("titulo", "")

        store[str_id] = data.copy()  # Store a copy
        print(f"DEBUG: Created category {data['id']}, store has: {list(store.keys())}")
        return jsonify(data), 201

    ok, errors, data = prepare_new_category(db, payload)
    if not ok:
        return jsonify({"errors": errors}), 400
        
    coll = get_collection(db)
    try:
        coll.insert_one(data)
        return jsonify(data), 201
    except Exception as e:
        if "duplicate key" in str(e):
            return jsonify({"error": "ID já existe"}), 409
        return jsonify({"error": str(e)}), 500

def update_category(id: int):
    """Atualiza uma categoria existente."""
    payload = request.get_json(silent=True) or {}
    db = _get_db()
    
    if db is None:
        store = _get_store()
        print(f"DEBUG: Updating category {id}, store has: {list(store.keys())}")
        str_id = str(id)
        if str_id not in store:
            return jsonify({"error": "Categoria não encontrada"}), 404
            
        data = normalize_category(payload)
        merged = dict(store[str_id])
        merged.update(data)
        merged["id"] = int(id)  # Manter ID original
        ok, errors = validate_category(merged)
        if not ok:
            return jsonify({"errors": errors}), 400
            
        store[str_id] = merged.copy()  # Store a copy
        return jsonify(merged), 200

    coll = get_collection(db)
    existing = coll.find_one({"id": id}, {"_id": 0})
    if not existing:
        return jsonify({"error": "Categoria não encontrada"}), 404

    data = normalize_category(payload)
    merged = dict(existing)
    merged.update(data)
    ok, errors = validate_category(merged)
    if not ok:
        return jsonify({"errors": errors}), 400

    coll.update_one({"id": id}, {"$set": merged})
    return jsonify(merged), 200

def delete_category(id: int):
    """Desativa uma categoria (soft delete)."""
    db = _get_db()
    if db is None:
        store = _get_store()
        print(f"DEBUG: Deleting category {id}, store has: {list(store.keys())}")
        str_id = str(id)
        if str_id not in store:
            return jsonify({"error": "Categoria não encontrada"}), 404
        store[str_id]["ativo"] = False
        return jsonify({"message": "Categoria desativada", "category": store[str_id]}), 200

    coll = get_collection(db)
    result = coll.update_one({"id": id}, {"$set": {"ativo": False}})
    if result.matched_count == 0:
        return jsonify({"error": "Categoria não encontrada"}), 404
    return jsonify({"message": "Categoria desativada"}), 200

def activate_category(id: int):
    """Ativa uma categoria."""
    db = _get_db()
    if db is None:
        store = _get_store()
        str_id = str(id)
        if str_id not in store:
            return jsonify({"error": "Categoria não encontrada"}), 404
        store[str_id]["ativo"] = True
        return jsonify({"message": "Categoria ativada", "category": store[str_id]}), 200

    coll = get_collection(db)
    result = coll.update_one({"id": id}, {"$set": {"ativo": True}})
    if result.matched_count == 0:
        return jsonify({"error": "Categoria não encontrada"}), 404
    return jsonify({"message": "Categoria ativada"}), 200

def seed_categories():
    """Popula categorias padrão."""
    db = _get_db()
    if db is None:
        store = _get_store()
        if store:
            return jsonify({"inserted": 0}), 200
        for i, titulo in enumerate(["Roupas", "Acessórios", "Calçados"], 1):
            store[str(i)] = {
                "id": i,
                "titulo": titulo,
                "descricao": f"Categoria {titulo}",
                "ativo": True
            }
        return jsonify({"inserted": 3}), 200

    from app.models.category_model import seed_default_categories
    inserted = seed_default_categories(db)
    return jsonify({"inserted": inserted}), 200

def get_categories_summary():
    """Retorna resumo das categorias."""
    db = _get_db()
    if db is None:
        store = _get_store()
        total = len(store)
        active = len([c for c in store.values() if c["ativo"]])
        return jsonify({
            "total": total,
            "active": active,
            "inactive": total - active
        }), 200

    coll = get_collection(db)
    total = coll.count_documents({})
    active = coll.count_documents({"ativo": True})
    return jsonify({
        "total": total,
        "active": active,
        "inactive": total - active
    }), 200