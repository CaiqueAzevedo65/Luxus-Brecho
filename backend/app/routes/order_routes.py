"""
Rotas para gerenciamento de pedidos.
"""
from flask import Blueprint
from app.controllers.order_controller import (
    get_user_orders,
    get_order_by_id,
    create_order,
    update_order_status,
    cancel_order,
)

order_bp = Blueprint("orders", __name__)


@order_bp.route("/user/<int:user_id>", methods=["GET"])
def get_orders(user_id):
    """Obtém todos os pedidos do usuário."""
    return get_user_orders(user_id)


@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order(order_id):
    """Obtém um pedido específico."""
    return get_order_by_id(order_id)


@order_bp.route("/user/<int:user_id>", methods=["POST"])
def create(user_id):
    """Cria um novo pedido."""
    return create_order(user_id)


@order_bp.route("/<int:order_id>/status", methods=["PUT"])
def update_status(order_id):
    """Atualiza o status de um pedido."""
    return update_order_status(order_id)


@order_bp.route("/<int:order_id>/cancel", methods=["POST"])
def cancel(order_id):
    """Cancela um pedido."""
    return cancel_order(order_id)
