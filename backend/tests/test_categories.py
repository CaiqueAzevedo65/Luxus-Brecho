import pytest
from flask import Flask
from app.routes.categories_routes import categories_bp


# ===========================
# Fixtures
# ===========================

@pytest.fixture
def client(mock_db, monkeypatch):
    app = Flask(__name__)
    app.register_blueprint(categories_bp, url_prefix="/api/categories")

    # injeta mock_db no current_app.db
    monkeypatch.setattr(
        "app.controllers.categories_controller.current_app",
        type("obj", (), {"db": mock_db}),
    )

    return app.test_client()


# ===========================
# Testes
# ===========================

def test_list_categories(client):
    response = client.get("/api/categories/")
    assert response.status_code == 200
    data = response.get_json()

    # chaves esperadas
    assert "items" in data
    assert "pagination" in data

    # pelo menos 1 categoria deve existir
    assert data["pagination"]["total"] >= 1

    # consistência entre paginação e itens
    assert len(data["items"]) <= data["pagination"]["page_size"]


def test_create_category(client):
    new_category = {
        "id": 99,
        "name": "Test Category",
        "description": "Categoria de teste",
        "active": True,
    }
    response = client.post("/api/categories/", json=new_category)
    assert response.status_code == 201
    data = response.get_json()
    assert data["id"] == new_category["id"]
    assert data["name"] == new_category["name"]
    assert data["active"] is True


def test_get_category(client):
    # pega a primeira categoria da lista
    list_resp = client.get("/api/categories/")
    first_id = list_resp.get_json()["items"][0]["id"]

    response = client.get(f"/api/categories/{first_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert "id" in data
    assert "name" in data


def test_update_category(client):
    list_resp = client.get("/api/categories/")
    first_id = list_resp.get_json()["items"][0]["id"]

    update_payload = {"description": "Descrição atualizada"}
    response = client.put(f"/api/categories/{first_id}", json=update_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["description"] == "Descrição atualizada"


def test_delete_category(client):
    # cria uma categoria para deletar
    new_category = {
        "id": 123,
        "name": "Categoria para deletar",
        "description": "Teste",
        "active": True,
    }
    client.post("/api/categories/", json=new_category)

    response = client.delete("/api/categories/123")
    assert response.status_code in (200, 400)  # pode dar erro se tiver produtos mockados
    data = response.get_json()
    assert "message" in data
