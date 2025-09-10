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


def test_list_products(client):
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.get_json()

    assert "items" in data
    assert "pagination" in data
    assert data["pagination"]["total"] >= 0


def test_create_product(client):
    new_product = {
        "id": 999,
        "nome": "Produto Teste",
        "categoria": "Roupas",
        "preco": 100.0,
        "ativo": True,
    }
    response = client.post("/api/products/", json=new_product)
    assert response.status_code in (201, 409)  # 409 se id já existir
    data = response.get_json()
    assert "message" in data or "id" in data
