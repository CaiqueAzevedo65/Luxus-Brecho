from flask import Blueprint
from app.controllers.products_controller import (
    list_products,
    get_product,
    create_product,
    update_product,
    delete_product,
    get_products_by_category,
)

products_bp = Blueprint("products", __name__, url_prefix="/products")

products_bp.route("/", methods=["GET"])(list_products)
products_bp.route("/<int:id>", methods=["GET"])(get_product)
products_bp.route("/", methods=["POST"])(create_product)
products_bp.route("/<int:id>", methods=["PUT"])(update_product)
products_bp.route("/<int:id>", methods=["DELETE"])(delete_product)
products_bp.route("/category/<string:categoria>", methods=["GET"])(get_products_by_category)
