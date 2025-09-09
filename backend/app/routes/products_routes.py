from flask import Blueprint
from app.controllers.products_controller import (
    list_products,
    get_product,
    create_product,
    update_product,
    delete_product,
    get_products_by_category,
    create_product_with_image,
    update_product_image,
)

products_bp = Blueprint("products", __name__)

products_bp.route("/", methods=["GET"])(list_products)
products_bp.route("/<int:id>", methods=["GET"])(get_product)
products_bp.route("/", methods=["POST"])(create_product)
products_bp.route("/<int:id>", methods=["PUT"])(update_product)
products_bp.route("/<int:id>", methods=["DELETE"])(delete_product)
products_bp.route("/category/<string:categoria>", methods=["GET"])(get_products_by_category)

# Rotas para upload de imagens
products_bp.route("/with-image", methods=["POST"])(create_product_with_image)
products_bp.route("/<int:id>/image", methods=["PUT"])(update_product_image)
