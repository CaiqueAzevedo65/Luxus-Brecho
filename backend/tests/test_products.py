import pytest
from flask import Flask
from app.routes.products_routes import products_bp


@pytest.fixture
def client(mock_db, monkeypatch):
    app = Flask(__name__)
    app.register_blueprint(products_bp, url_prefix="/api/products")

    # injeta mock_db no current_app.db do controller
    monkeypatch.setattr(
        "app.controllers.products_controller.current_app",
        type("obj", (), {"db": mock_db}),
    )

    return app.test_client()


def valid_product(id=1):
    return {
        "id": id,
        "titulo": f"Produto Teste {id}",
        "descricao": "Descrição válida de produto com mais de 10 caracteres",
        "preco": 99.9,
        "categoria": "Casual",   # categoria padrão permitida
        "imagem": "http://example.com/test.jpg",
    }


def test_list_products(client):
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert "pagination" in data
    assert data["pagination"]["total"] >= 0


def test_create_product(client):
    response = client.post("/api/products/", json=valid_product(1001))
    assert response.status_code in (201, 409)
    data = response.get_json()
    assert "id" in data or "message" in data


def test_create_duplicate_product(client):
    prod = valid_product(2002)
    client.post("/api/products/", json=prod)
    response = client.post("/api/products/", json=prod)
    assert response.status_code == 409


def test_get_product(client):
    prod = valid_product(3003)
    client.post("/api/products/", json=prod)
    response = client.get(f"/api/products/{prod['id']}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == prod["id"]


def test_update_product(client):
    prod = valid_product(4004)
    client.post("/api/products/", json=prod)
    update_data = {"titulo": "Produto Atualizado", "descricao": "Descrição nova válida"}
    response = client.put(f"/api/products/{prod['id']}", json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data["titulo"] == "Produto Atualizado"


def test_delete_product(client):
    prod = valid_product(5005)
    client.post("/api/products/", json=prod)
    response = client.delete(f"/api/products/{prod['id']}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "deleted"
    # conferir se realmente sumiu
    response = client.get(f"/api/products/{prod['id']}")
    assert response.status_code == 404
