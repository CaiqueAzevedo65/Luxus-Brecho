from flask import Blueprint, request, jsonify
from models.category_model import (
    get_collection,
    prepare_new_category,
    normalize_category,
    validate_category,
)

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("/", methods=["GET"])
def list_categories():
    db = request.db
    coll = get_collection(db)
    categorias = list(coll.find({}, {"_id": 0}))
    return jsonify(categorias), 200


@categories_bp.route("/", methods=["POST"])
def create_category():
    db = request.db
    coll = get_collection(db)
    ok, errors, data = prepare_new_category(db, request.json)
    if not ok:
        return jsonify({"errors": errors}), 400

    try:
        coll.insert_one(data)
        return jsonify(data), 201
    except Exception:
        return jsonify({"error": "Categoria já existe"}), 409


@categories_bp.route("/<int:cat_id>", methods=["PUT"])
def update_category(cat_id: int):
    db = request.db
    coll = get_collection(db)
    updates = normalize_category(request.json)
    ok, errors = validate_category({**updates, "id": cat_id})
    if not ok:
        return jsonify({"errors": errors}), 400

    res = coll.update_one({"id": cat_id}, {"$set": updates})
    if res.matched_count == 0:
        return jsonify({"error": "Categoria não encontrada"}), 404
    return jsonify({"msg": "Categoria atualizada"}), 200


@categories_bp.route("/<int:cat_id>", methods=["DELETE"])
def delete_category(cat_id: int):
    db = request.db
    coll = get_collection(db)
    res = coll.delete_one({"id": cat_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Categoria não encontrada"}), 404
    return jsonify({"msg": "Categoria excluída"}), 200
