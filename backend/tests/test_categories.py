# python
# File: backend/tests/test_categories.py

def test_list_categories(client):
    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_create_category(client):
    new_category = {
        "id": 1234,
        "titulo": "TesteCategoria",
        "descricao": "Categoria de teste",
        "ativo": True
    }
    response = client.post("/api/categories/", json=new_category)
    assert response.status_code in (201, 409)

def test_update_category(client):
    # First create the category with valid data
    category = {
        "id": 5678,
        "titulo": "CatTeste",
        "descricao": "Descrição de teste com mais de 5 caracteres",  # Fix: longer description
        "ativo": True
    }
    create_response = client.post("/api/categories/", json=category)
    assert create_response.status_code == 201

    # Then try to update it
    update_response = client.put(
        f"/api/categories/{category['id']}", 
        json={"titulo": "Atualizada", "descricao": category["descricao"]}  # Keep valid description
    )
    assert update_response.status_code == 200
    data = update_response.get_json()
    assert data["titulo"] == "Atualizada"

def test_delete_category(client):
    # First create the category with valid data
    category = {
        "id": 91011,
        "titulo": "CatDelete",
        "descricao": "Descrição de teste para deletar",  # Fix: longer description
        "ativo": True
    }
    create_response = client.post("/api/categories/", json=category)
    assert create_response.status_code == 201

    # Then try to delete it
    delete_response = client.delete(f"/api/categories/{category['id']}")
    assert delete_response.status_code == 200
    data = delete_response.get_json()
    assert data["category"]["ativo"] is False