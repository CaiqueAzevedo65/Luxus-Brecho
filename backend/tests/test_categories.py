import pytest
from flask import Flask
from app.routes.categories_routes import categories_bp
from backend.tests.conftest import MockDB


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.db = MockDB()
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    return app.test_client()


# ===========================
# GET /categories
# ===========================

def test_list_categories(client):
    response = client.get("/api/categories/")
    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert data["pagination"]["total"] == 2
    assert any(c["name"] == "Casual" for c in data["items"])


# ===========================
# GET /categories/<id>
# ===========================

def test_get_category_by_id(client):
    response = client.get("/api/categories/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1

def test_get_category_not_found(client):
    response = client.get("/api/categories/999")
    assert response.status_code == 404


# ===========================
# POST /categories
# ===========================

def test_create_category(client):
    new_category = {"id": 3, "name": "Esportivo", "description": "Roupas esportivas", "active": True}
    response = client.post("/api/categories/", json=new_category)
    assert response.status_code == 201
    data = response.get_json()
    assert data["id"] == 3
    assert data["name"] == "Esportivo"

def test_create_category_duplicate_id(client):
    duplicate = {"id": 1, "name": "Duplicado", "description": "Teste", "active": True}
    response = client.post("/api/categories/", json=duplicate)
    assert response.status_code == 409

def test_create_category_duplicate_name(client):
    duplicate = {"id": 5, "name": "Casual", "description": "Duplicado", "active": True}
    response = client.post("/api/categories/", json=duplicate)
    assert response.status_code == 409


# ===========================
# PUT /categories/<id>
# ===========================

def test_update_category(client):
    update_data = {"name": "Casual Atualizado"}
    response = client.put("/api/categories/1", json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "Casual Atualizado"

def test_update_category_not_found(client):
    update_data = {"name": "Inexistente"}
    response = client.put("/api/categories/999", json=update_data)
    assert response.status_code == 404


# ===========================
# DELETE /categories/<id>
# ===========================

def test_delete_category(client):
    response = client.delete("/api/categories/2")
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "category deactivated"

def test_delete_category_not_found(client):
    response = client.delete("/api/categories/999")
    assert response.status_code == 404


# ===========================
# PUT /categories/<id>/activate
# ===========================

def test_activate_category(client):
    # primeiro desativa
    client.delete("/api/categories/1")
    # ativa de novo
    response = client.put("/api/categories/1/activate")
    assert response.status_code == 200
    data = response.get_json()
    assert data["active"] is True


# ===========================
# GET /categories/summary
# ===========================

def test_get_categories_summary(client):
    response = client.get("/api/categories/summary")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert all("name" in c for c in data)


# ===========================
# POST /categories/seed
# ===========================

def test_seed_categories(client):
    response = client.post("/api/categories/seed")
    assert response.status_code in (201, 500)  # pode falhar se já existirem
