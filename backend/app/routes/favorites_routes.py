"""
Rotas para gerenciar favoritos dos usuários.
Todas as rotas requerem autenticação via header X-User-Id.
"""
from flask import Blueprint
from app.controllers.favorites_controller import (
    list_user_favorites,
    add_to_favorites,
    remove_from_favorites,
    check_favorite,
    toggle_favorite,
    require_auth
)

favorites_bp = Blueprint("favorites", __name__)

# Listar favoritos do usuário
favorites_bp.route("/", methods=["GET"])(require_auth(list_user_favorites))

# Adicionar produto aos favoritos
favorites_bp.route("/", methods=["POST"])(require_auth(add_to_favorites))

# Remover produto dos favoritos
@favorites_bp.route("/<int:product_id>", methods=["DELETE"])
@require_auth
def remove_favorite_route(user_id, product_id):
    return remove_from_favorites(user_id, product_id)

# Verificar se produto está favoritado
@favorites_bp.route("/check/<int:product_id>", methods=["GET"])
@require_auth
def check_favorite_route(user_id, product_id):
    return check_favorite(user_id, product_id)

# Alternar favorito (toggle)
favorites_bp.route("/toggle", methods=["POST"])(require_auth(toggle_favorite))
