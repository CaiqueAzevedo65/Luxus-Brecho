import pytest
from flask import Flask
from app.routes.products_routes import products_bp


@pytest.fixture
def client(mock_db, monkeypatch):
    app = Flask(__name__)
    app.register_blueprint(products_bp, url_prefix="/api/products")

    # injeta mock_db no current_app.db
    monkeypatch.setattr("app.routes.products_routes.current_app", type("obj", (), {"db": mock_db}))

    with app.test_client() as client:
        yield client


def test_list_products(client):
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert len(data["items"]) >= 1


def test_get_product(client):
    response = client.get("/api/products/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["titulo"] == "Produto 1"


def test_get_product_not_found(client):
    response = client.get("/api/products/999")
    assert response.status_code == 404


def test_create_product(client):
    new_product = {
        "id": 3,
        "titulo": "Produto 3",
        "preco": 30.0,
        "descricao": "Desc 3",
        "categoria": "Esportivo",
        "imagem": "img3.jpg"
    }
    response = client.post("/api/products/", json=new_product)
    assert response.status_code == 201
    data = response.get_json()
    assert data["id"] == 3
