from flask import request, jsonify, current_app
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from typing import Any, Dict

from ..models.product_model import (
    get_collection,
    prepare_new_product,
    validate_product,
    normalize_product,
)


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
