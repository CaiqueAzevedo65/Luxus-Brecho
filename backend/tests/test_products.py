import pytest
from flask import Flask
from app.routes.products_routes import products_bp
from pymongo.errors import DuplicateKeyError

# ===========================
# Mock do MongoDB e Cursor
# ===========================

class MockCursor:
    def __init__(self, docs):
        self.docs = docs

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        start = getattr(self, "_skip", 0)
        end = start + n
        return self.docs[start:end]

    def sort(self, *args, **kwargs):
        return self


class MockDB:
    def __init__(self):
        self.products = [
            {"id": 1, "titulo": "Produto 1", "preco": 10.0, "descricao": "Desc 1",
             "categoria": "Casual", "imagem": "img1.jpg"},
            {"id": 2, "titulo": "Produto 2", "preco": 20.0, "descricao": "Desc 2",
             "categoria": "Social", "imagem": "img2.jpg"},
        ]

    def __getitem__(self, name):
        return self

    def find(self, query):
        return MockCursor(self.products)

    def count_documents(self, query):
        return len(self.products)

    def find_one(self, query):
        for doc in self.products:
            if doc["id"] == query.get("id"):
                return doc
        return None

    def insert_one(self, doc):
        if any(d["id"] == doc["id"] for d in self.products):
            raise DuplicateKeyError("duplicate key")
        self.products.append(doc)

    def update_one(self, filter_doc, update_doc):
        for i, d in enumerate(self.products):
            if d["id"] == filter_doc["id"]:
                self.products[i].update(update_doc["$set"])
                return

    def delete_one(self, filter_doc):
        initial_len = len(self.products)
        self.products = [d for d in self.products if d["id"] != filter_doc["id"]]
        class Res:
            deleted_count = initial_len - len(self.products)
        return Res()


# ===========================
# Fixtures
# ===========================

@pytest.fixture
def app():
    app = Flask(__name__)
    app.db = MockDB()
    app.register_blueprint(products_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()


# ===========================
# Testes
# ===========================

# GET /products
def test_list_products(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert len(data["items"]) == 2
    assert data["pagination"]["total"] == 2

# GET /products/<id>
def test_get_product_by_id(client):
    response = client.get("/api/products/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1

def test_get_product_not_found(client):
    response = client.get("/api/products/999")
    assert response.status_code == 404

# POST /products
def test_create_product(client):
    new_product = {
        "id": 3,
        "titulo": "Produto 3",
        "preco": 30.0,
        "descricao": "Desc 3",
        "categoria": "Esportivo",
        "imagem": "img3.jpg"
    }
    response = client.post("/api/products", json=new_product)
    assert response.status_code == 201
    data = response.get_json()
    assert data["id"] == 3

def test_create_product_duplicate(client):
    duplicate_product = {
        "id": 1,
        "titulo": "Produto 1",
        "preco": 10.0,
        "descricao": "Desc 1",
        "categoria": "Casual",
        "imagem": "img1.jpg"
    }
    response = client.post("/api/products", json=duplicate_product)
    assert response.status_code == 409

# PUT /products/<id>
def test_update_product(client):
    update_data = {"titulo": "Produto 1 Atualizado"}
    response = client.put("/api/products/1", json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data["titulo"] == "Produto 1 Atualizado"

def test_update_product_not_found(client):
    update_data = {"titulo": "Produto Inexistente"}
    response = client.put("/api/products/999", json=update_data)
    assert response.status_code == 404

# DELETE /products/<id>
def test_delete_product(client):
    response = client.delete("/api/products/2")
    assert response.status_code == 200

def test_delete_product_not_found(client):
    response = client.delete("/api/products/999")
    assert response.status_code == 404
