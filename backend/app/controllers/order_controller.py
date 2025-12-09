"""
Controller para gerenciamento de pedidos.
"""
from flask import jsonify, request, current_app
from datetime import datetime
from typing import Dict, Any

from ..models.order_model import (
    get_collection,
    get_next_id,
    normalize_order,
    validate_order,
    ORDER_STATUS,
)
from ..models.cart_model import get_collection as get_cart_collection


def get_user_orders(user_id: int):
    """Obtém todos os pedidos do usuário."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        coll = get_collection(db)
        orders = list(coll.find({"user_id": user_id}).sort("created_at", -1))
        
        return jsonify({
            "orders": [normalize_order(order) for order in orders],
            "total": len(orders),
        })

    except Exception as e:
        print(f"Erro ao obter pedidos: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def get_order_by_id(order_id: int):
    """Obtém um pedido específico pelo ID."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        coll = get_collection(db)
        order = coll.find_one({"id": order_id})
        
        if not order:
            return jsonify(message="Pedido não encontrado"), 404
        
        return jsonify(normalize_order(order))

    except Exception as e:
        print(f"Erro ao obter pedido: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def create_order(user_id: int):
    """Cria um novo pedido."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        payload = request.get_json()
        if not payload:
            return jsonify(message="Payload JSON é obrigatório"), 400

        payload["user_id"] = user_id
        
        # Valida dados do pedido
        is_valid, error_msg = validate_order(payload)
        if not is_valid:
            return jsonify(message=error_msg), 400

        # Busca informações dos produtos
        products_coll = db["products"]
        items_with_details = []
        total = 0
        
        for item in payload.get("items", []):
            product = products_coll.find_one({"id": item.get("product_id")})
            if product:
                item_total = (product.get("preco", 0)) * item.get("quantity", 1)
                items_with_details.append({
                    "product_id": item.get("product_id"),
                    "quantity": item.get("quantity", 1),
                    "preco_unitario": product.get("preco", 0),
                    "preco_total": item_total,
                    "titulo": product.get("titulo"),
                    "imagem_url": product.get("imagem_url"),
                })
                total += item_total
                
                # Atualiza status do produto para vendido
                products_coll.update_one(
                    {"id": item.get("product_id")},
                    {"$set": {"status": "vendido"}}
                )

        coll = get_collection(db)
        now = datetime.utcnow()
        
        order_id = get_next_id(db)
        
        order = {
            "id": order_id,
            "user_id": user_id,
            "items": items_with_details,
            "total": total,
            "status": "confirmado",
            "endereco": payload.get("endereco"),
            "created_at": now,
            "updated_at": now,
        }
        
        coll.insert_one(order)
        
        # Limpa o carrinho do usuário
        cart_coll = get_cart_collection(db)
        cart_coll.update_one(
            {"user_id": user_id},
            {"$set": {"items": [], "updated_at": now}}
        )

        return jsonify({
            "message": "Pedido criado com sucesso",
            "order": normalize_order(order),
        }), 201

    except Exception as e:
        print(f"Erro ao criar pedido: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def update_order_status(order_id: int):
    """Atualiza o status de um pedido."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        payload = request.get_json()
        if not payload:
            return jsonify(message="Payload JSON é obrigatório"), 400

        new_status = payload.get("status")
        if not new_status or new_status not in ORDER_STATUS:
            return jsonify(message=f"Status inválido. Valores permitidos: {', '.join(ORDER_STATUS)}"), 400

        coll = get_collection(db)
        now = datetime.utcnow()

        result = coll.update_one(
            {"id": order_id},
            {"$set": {"status": new_status, "updated_at": now}}
        )

        if result.matched_count == 0:
            return jsonify(message="Pedido não encontrado"), 404

        return jsonify({
            "message": "Status atualizado com sucesso",
            "order_id": order_id,
            "status": new_status,
        })

    except Exception as e:
        print(f"Erro ao atualizar status: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def cancel_order(order_id: int):
    """Cancela um pedido."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        coll = get_collection(db)
        products_coll = db["products"]
        now = datetime.utcnow()

        # Busca o pedido
        order = coll.find_one({"id": order_id})
        if not order:
            return jsonify(message="Pedido não encontrado"), 404

        if order.get("status") == "cancelado":
            return jsonify(message="Pedido já está cancelado"), 400

        if order.get("status") in ["enviado", "entregue"]:
            return jsonify(message="Não é possível cancelar pedido já enviado ou entregue"), 400

        # Restaura status dos produtos para disponível
        for item in order.get("items", []):
            products_coll.update_one(
                {"id": item.get("product_id")},
                {"$set": {"status": "disponivel"}}
            )

        # Atualiza status do pedido
        coll.update_one(
            {"id": order_id},
            {"$set": {"status": "cancelado", "updated_at": now}}
        )

        return jsonify({
            "message": "Pedido cancelado com sucesso",
            "order_id": order_id,
        })

    except Exception as e:
        print(f"Erro ao cancelar pedido: {e}")
        return jsonify(message="Erro interno do servidor"), 500
