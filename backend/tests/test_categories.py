import pytest
from flask import Flask
from app.routes.categories_routes import categories_bp


@pytest.fixture
def client(mock_db, monkeypatch):
    app = Flask(__name__)
    app.register_blueprint(categories_bp, url_prefix="/api/categories")

    # injeta mock_db no current_app.db
    monkeypatch.setattr("app.routes.categories_routes.current_app", type("obj", (), {"db": mock_db}))

    with app.test_client() as client:
        yield client


def test_list_categories(client):
    response = client.get("/api/categories/")
    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert len(data["items"]) >= 1


def test_list_active_categories(client):
    response = client.get("/api/categories/?active_only=true")
    assert response.status_code == 200
    data = response.get_json()
    assert all(c["active"] is True for c in data["items"])


def test_get_category(client):
    response = client.get("/api/categories/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "Casual"


def test_get_category_not_found(client):
    response = client.get("/api/categories/999")
    assert response.status_code == 404


def test_create_category(client):
    new_category = {
        "id": 4,
        "name": "Social",
        "description": "Roupas sociais",
        "active": True
    }
    response = client.post("/api/categories/", json=new_category)
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Social"


def test_create_category_duplicate_name(client):
    duplicate_category = {
        "id": 5,
        "name": "Casual",
        "description": "Duplicada",
        "active": True
    }
    response = client.post("/api/categories/", json=duplicate_category)
    assert response.status_code == 409


def test_update_category(client):
    updated_category = {"description": "Roupas casuais atualizadas"}
    response = client.put("/api/categories/1", json=updated_category)
    assert response.status_code == 200
    data = response.get_json()
    assert data["description"] == "Roupas casuais atualizadas"


def test_delete_category(client):
    response = client.delete("/api/categories/2")
    assert response.status_code in (200, 400)  # depende se tem produto vinculado


def test_activate_category(client):
    response = client.put("/api/categories/3/activate")
    assert response.status_code == 200
    data = response.get_json()
    assert data["active"] is True
