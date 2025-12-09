"""
Modelo para gerenciamento de carrinhos de compras.
Cada usuário pode ter um carrinho com múltiplos itens.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from bson import ObjectId

COLLECTION_NAME = "carts"


def get_collection(db):
    """Retorna a coleção de carrinhos."""
    return db[COLLECTION_NAME]


def normalize_cart(cart: Dict[str, Any]) -> Dict[str, Any]:
    """Normaliza documento do carrinho para resposta da API."""
    if not cart:
        return {}
    
    normalized = {
        "id": str(cart.get("_id", "")),
        "user_id": cart.get("user_id"),
        "items": cart.get("items", []),
        "created_at": cart.get("created_at", datetime.utcnow()).isoformat() if cart.get("created_at") else None,
        "updated_at": cart.get("updated_at", datetime.utcnow()).isoformat() if cart.get("updated_at") else None,
    }
    
    return normalized


def normalize_cart_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """Normaliza item do carrinho."""
    return {
        "product_id": item.get("product_id"),
        "quantity": item.get("quantity", 1),
        "added_at": item.get("added_at", datetime.utcnow()).isoformat() if item.get("added_at") else None,
    }


def validate_cart_item(item: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Valida item do carrinho."""
    if not item.get("product_id"):
        return False, "ID do produto é obrigatório"
    
    quantity = item.get("quantity", 1)
    if not isinstance(quantity, int) or quantity < 1:
        return False, "Quantidade deve ser um número inteiro positivo"
    
    return True, None
