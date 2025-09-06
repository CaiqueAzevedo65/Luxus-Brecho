from flask import Blueprint
from app.controllers.categories_controller import (
    list_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
    activate_category,
    seed_categories,
    get_categories_summary,
)

categories_bp = Blueprint("categories", __name__, url_prefix="/categories")

# CRUD básico
categories_bp.route("/", methods=["GET"])(list_categories)
categories_bp.route("/<int:id>", methods=["GET"])(get_category)
categories_bp.route("/", methods=["POST"])(create_category)
categories_bp.route("/<int:id>", methods=["PUT"])(update_category)
categories_bp.route("/<int:id>", methods=["DELETE"])(delete_category)

# Operações especiais
categories_bp.route("/<int:id>/activate", methods=["PUT"])(activate_category)
categories_bp.route("/seed", methods=["POST"])(seed_categories)
categories_bp.route("/summary", methods=["GET"])(get_categories_summary)
