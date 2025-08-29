from flask import Blueprint
from app.controllers.products_controller import (
    list_products,
    get_product,
    create_product,
    update_product,
    delete_product,
)

products_bp = Blueprint("products", __name__, url_prefix="/api")

# Listar e criar
products_bp.route("/products", methods=["GET"])(list_products)
products_bp.route("/products", methods=["POST"])(create_product)

# Detalhar, atualizar e remover
products_bp.route("/products/<int:id>", methods=["GET"])(get_product)
products_bp.route("/products/<int:id>", methods=["PUT"])(update_product)
products_bp.route("/products/<int:id>", methods=["DELETE"])(delete_product)
