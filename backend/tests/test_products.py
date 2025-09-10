import pytest
from flask import Flask
from app.routes.products_routes import products_bp


@pytest.fixture
def client(mock_db, monkeypatch):
    app = Flask(__name__)
    app.register_blueprint(products_bp, url_prefix="/api/products")

    # injeta mock_db no current_app.db
    monkeypatch.setattr("app.routes.products_routes.current_app", type("obj", (), {"db": mock_db}))

    return app.test_client()


def test_list_products(client):
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert isinstance(data["items"], list)


def test_create_product(client):
    new_product = {
        "id": 999,
        "titulo": "Produto Teste",
        "preco": 100.0,
        "descricao": "Descrição de teste do produto",
        "categoria": "Casual",  # precisa ser válida
        "imagem": "http://example.com/img.jpg",
    }
    response = client.post("/api/products/", json=new_product)
    assert response.status_code in (201, 409)  # 409 se id já existir
    data = response.get_json()
    assert "message" in data or "id" in data


def test_get_product_not_found(client):
    response = client.get("/api/products/999999")
    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "product not found"
