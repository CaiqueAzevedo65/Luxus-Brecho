"""
Rotas para gerenciamento de imagens de produtos
Integração com Supabase Storage
"""
from flask import Blueprint
from app.controllers.images_controller import (
    upload_product_image,
    delete_product_image,
    list_product_images,
    get_image_info,
    upload_multiple_images
)

images_bp = Blueprint("images", __name__)

# Upload de imagem única
images_bp.route("/upload", methods=["POST"])(upload_product_image)

# Upload de múltiplas imagens
images_bp.route("/upload-multiple", methods=["POST"])(upload_multiple_images)

# Deletar imagem
images_bp.route("/delete", methods=["DELETE"])(delete_product_image)

# Listar imagens de um produto
images_bp.route("/product/<int:product_id>", methods=["GET"])(list_product_images)

# Informações sobre uma imagem
images_bp.route("/info", methods=["POST"])(get_image_info)
