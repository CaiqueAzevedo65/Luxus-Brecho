# python
# File: backend/tests/test_category_store.py
import pytest
from flask import current_app

def test_store_persistence(client):
    """Testa se o store mantém os dados entre requisições."""
    # Create
    cat1 = {
        "id": 1234,
        "titulo": "Test Category",
        "descricao": "Test Description",
        "ativo": True
    }
    response = client.post("/api/categories/", json=cat1)
    assert response.status_code == 201
    
    # Verify exists
    response = client.get("/api/categories/1234")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1234
    assert data["titulo"] == "Test Category"
    
    # Update
    response = client.put("/api/categories/1234", json={"titulo": "Updated Category"})
    assert response.status_code == 200
    
    # Verify update
    response = client.get("/api/categories/1234")
    assert response.status_code == 200
    data = response.get_json()
    assert data["titulo"] == "Updated Category"
    
    # Delete (soft)
    response = client.delete("/api/categories/1234")
    assert response.status_code == 200
    
    # Verify inactive
    response = client.get("/api/categories/1234")
    assert response.status_code == 200
    data = response.get_json()
    assert data["ativo"] is False