def test_list_categories(client):
    resp = client.get("/api/categories/")
    assert resp.status_code == 200
    assert isinstance(resp.json, list)

def test_create_category(client):
    new_category = {"id": 1234, "titulo": "TesteCategoria", "descricao": "Categoria de teste", "ativo": True}
    response = client.post("/api/categories/", json=new_category)
    assert response.status_code in (201, 409)

def test_update_category(client):
    category = {"id": 5678, "titulo": "CatTeste", "descricao": "desc", "ativo": True}
    client.post("/api/categories/", json=category)

    response = client.put(f"/api/categories/{category['id']}", json={"titulo": "Atualizada"})
    assert response.status_code == 200

def test_delete_category(client):
    category = {"id": 91011, "titulo": "CatDelete", "descricao": "desc", "ativo": True}
    client.post("/api/categories/", json=category)

    response = client.delete(f"/api/categories/{category['id']}")
    assert response.status_code == 200
