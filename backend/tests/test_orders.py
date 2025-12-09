"""
Testes para rotas de pedidos.
"""
import pytest
import json
from datetime import datetime


class TestOrdersList:
    """Testes para listagem de pedidos."""
    
    def test_list_orders_empty(self, client, mock_db):
        """Testa listagem quando não há pedidos."""
        response = client.get("/api/orders/user/1")
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert "orders" in data
        assert data["orders"] == []
    
    def test_list_orders_with_data(self, client, mock_db, sample_order):
        """Testa listagem com pedidos cadastrados."""
        mock_db["orders"].insert_one(sample_order)
        
        response = client.get(f"/api/orders/user/{sample_order['user_id']}")
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert "orders" in data
        assert len(data["orders"]) >= 1


class TestOrderCreate:
    """Testes para criação de pedidos."""
    
    def test_create_order_success(self, client, mock_db, sample_product):
        """Testa criação de pedido com sucesso."""
        mock_db["products"].insert_one(sample_product)
        mock_db["counters"].insert_one({"_id": "orders", "seq": 0})
        mock_db["carts"].insert_one({
            "user_id": 1,
            "items": [
                {
                    "product_id": sample_product["id"],
                    "quantity": 1,
                    "added_at": datetime.utcnow(),
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        
        order_data = {
            "items": [
                {
                    "product_id": sample_product["id"],
                    "quantity": 1,
                }
            ],
            "endereco": {
                "rua": "Rua Teste",
                "numero": "123",
                "complemento": "Apto 1",
                "bairro": "Centro",
                "cidade": "São Paulo",
                "estado": "SP",
                "cep": "01234-567",
            }
        }
        
        response = client.post(
            "/api/orders/user/1",
            data=json.dumps(order_data),
            content_type="application/json"
        )
        
        assert response.status_code in [200, 201]
        data = response.get_json()
        
        assert "order" in data or "id" in data
    
    def test_create_order_missing_items(self, client, mock_db):
        """Testa criação sem itens."""
        order_data = {
            "items": [],
            "endereco": {
                "rua": "Rua Teste",
                "numero": "123",
                "bairro": "Centro",
                "cidade": "São Paulo",
                "estado": "SP",
                "cep": "01234-567",
            }
        }
        
        response = client.post(
            "/api/orders/user/1",
            data=json.dumps(order_data),
            content_type="application/json"
        )
        
        assert response.status_code == 400
    
    def test_create_order_missing_address(self, client, mock_db, sample_product):
        """Testa criação sem endereço."""
        mock_db["products"].insert_one(sample_product)
        
        order_data = {
            "items": [
                {
                    "product_id": sample_product["id"],
                    "quantity": 1,
                }
            ],
        }
        
        response = client.post(
            "/api/orders/user/1",
            data=json.dumps(order_data),
            content_type="application/json"
        )
        
        assert response.status_code == 400
    
    def test_create_order_incomplete_address(self, client, mock_db, sample_product):
        """Testa criação com endereço incompleto."""
        mock_db["products"].insert_one(sample_product)
        
        order_data = {
            "items": [
                {
                    "product_id": sample_product["id"],
                    "quantity": 1,
                }
            ],
            "endereco": {
                "rua": "Rua Teste",
                # Faltam campos obrigatórios
            }
        }
        
        response = client.post(
            "/api/orders/user/1",
            data=json.dumps(order_data),
            content_type="application/json"
        )
        
        assert response.status_code == 400


class TestOrderGet:
    """Testes para obter pedido específico."""
    
    def test_get_order_by_id(self, client, mock_db, sample_order):
        """Testa obter pedido por ID."""
        mock_db["orders"].insert_one(sample_order)
        
        response = client.get(f"/api/orders/{sample_order['id']}")
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data["id"] == sample_order["id"]
    
    def test_get_order_not_found(self, client, mock_db):
        """Testa obter pedido inexistente."""
        response = client.get("/api/orders/99999")
        
        assert response.status_code == 404


class TestOrderStatusUpdate:
    """Testes para atualização de status."""
    
    def test_update_status_success(self, client, mock_db, sample_order):
        """Testa atualização de status com sucesso."""
        mock_db["orders"].insert_one(sample_order)
        
        status_data = {
            "status": "em_preparacao",
        }
        
        response = client.put(
            f"/api/orders/{sample_order['id']}/status",
            data=json.dumps(status_data),
            content_type="application/json"
        )
        
        assert response.status_code == 200
    
    def test_update_status_invalid(self, client, mock_db, sample_order):
        """Testa atualização com status inválido."""
        mock_db["orders"].insert_one(sample_order)
        
        status_data = {
            "status": "status_invalido",
        }
        
        response = client.put(
            f"/api/orders/{sample_order['id']}/status",
            data=json.dumps(status_data),
            content_type="application/json"
        )
        
        assert response.status_code == 400
    
    def test_update_status_not_found(self, client, mock_db):
        """Testa atualização de pedido inexistente."""
        status_data = {
            "status": "em_preparacao",
        }
        
        response = client.put(
            "/api/orders/99999/status",
            data=json.dumps(status_data),
            content_type="application/json"
        )
        
        assert response.status_code == 404


class TestOrderCancel:
    """Testes para cancelamento de pedidos."""
    
    def test_cancel_order_success(self, client, mock_db, sample_order, sample_product):
        """Testa cancelamento de pedido com sucesso."""
        mock_db["orders"].insert_one(sample_order)
        mock_db["products"].insert_one(sample_product)
        
        response = client.post(f"/api/orders/{sample_order['id']}/cancel")
        
        assert response.status_code == 200
    
    def test_cancel_order_not_found(self, client, mock_db):
        """Testa cancelamento de pedido inexistente."""
        response = client.post("/api/orders/99999/cancel")
        
        assert response.status_code == 404
    
    def test_cancel_order_already_cancelled(self, client, mock_db, sample_order):
        """Testa cancelamento de pedido já cancelado."""
        sample_order["status"] = "cancelado"
        mock_db["orders"].insert_one(sample_order)
        
        response = client.post(f"/api/orders/{sample_order['id']}/cancel")
        
        assert response.status_code == 400
    
    def test_cancel_order_already_shipped(self, client, mock_db, sample_order):
        """Testa cancelamento de pedido já enviado."""
        sample_order["status"] = "enviado"
        mock_db["orders"].insert_one(sample_order)
        
        response = client.post(f"/api/orders/{sample_order['id']}/cancel")
        
        assert response.status_code == 400


class TestOrderFlow:
    """Testes de fluxo completo de pedido."""
    
    def test_complete_order_flow(self, client, mock_db, sample_product):
        """Testa fluxo completo: criar -> atualizar status -> entregar."""
        mock_db["products"].insert_one(sample_product)
        mock_db["counters"].insert_one({"_id": "orders", "seq": 0})
        mock_db["carts"].insert_one({
            "user_id": 1,
            "items": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        
        # 1. Criar pedido
        order_data = {
            "items": [
                {
                    "product_id": sample_product["id"],
                    "quantity": 1,
                }
            ],
            "endereco": {
                "rua": "Rua Teste",
                "numero": "123",
                "complemento": "",
                "bairro": "Centro",
                "cidade": "São Paulo",
                "estado": "SP",
                "cep": "01234-567",
            }
        }
        
        response = client.post(
            "/api/orders/user/1",
            data=json.dumps(order_data),
            content_type="application/json"
        )
        
        assert response.status_code in [200, 201]
        data = response.get_json()
        order_id = data.get("order", {}).get("id") or data.get("id")
        
        if order_id:
            # 2. Atualizar para em preparação
            response = client.put(
                f"/api/orders/{order_id}/status",
                data=json.dumps({"status": "em_preparacao"}),
                content_type="application/json"
            )
            assert response.status_code == 200
            
            # 3. Atualizar para enviado
            response = client.put(
                f"/api/orders/{order_id}/status",
                data=json.dumps({"status": "enviado"}),
                content_type="application/json"
            )
            assert response.status_code == 200
            
            # 4. Atualizar para entregue
            response = client.put(
                f"/api/orders/{order_id}/status",
                data=json.dumps({"status": "entregue"}),
                content_type="application/json"
            )
            assert response.status_code == 200
