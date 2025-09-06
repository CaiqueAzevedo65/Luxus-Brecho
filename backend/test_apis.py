#!/usr/bin/env python3
"""
Script de teste para as APIs de categorias e produtos.
Execute este script para testar os endpoints implementados.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Testa o endpoint de health check."""
    print("🏥 Testando Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_categories():
    """Testa os endpoints de categorias."""
    print("\n📁 Testando Categorias...")
    
    # 1. Seed das categorias padrão
    print("1. Criando categorias padrão...")
    try:
        response = requests.post(f"{BASE_URL}/categories/seed")
        print(f"Seed Status: {response.status_code}")
        if response.status_code in [201, 500]:  # 500 se já existirem
            print("✅ Categorias padrão criadas/já existem")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro no seed: {e}")
    
    # 2. Listar categorias
    print("\n2. Listando categorias...")
    try:
        response = requests.get(f"{BASE_URL}/categories")
        print(f"List Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Encontradas {len(data['items'])} categorias")
            for cat in data['items']:
                print(f"   - {cat['name']}: {cat['description']}")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro ao listar: {e}")
    
    # 3. Buscar resumo das categorias
    print("\n3. Buscando resumo das categorias...")
    try:
        response = requests.get(f"{BASE_URL}/categories/summary")
        print(f"Summary Status: {response.status_code}")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Resumo de {len(categories)} categorias ativas")
            return categories
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro no resumo: {e}")
    
    return []

def test_products(categories):
    """Testa os endpoints de produtos."""
    print("\n🛍️ Testando Produtos...")
    
    if not categories:
        print("❌ Sem categorias disponíveis para teste")
        return
    
    # 1. Criar um produto de teste
    print("1. Criando produto de teste...")
    test_product = {
        "titulo": "Camiseta Polo Casual",
        "descricao": "Camiseta polo em algodão 100%, perfeita para o dia a dia. Cor azul marinho, tamanho M.",
        "preco": 45.90,
        "categoria": categories[0]['name'],  # Primeira categoria disponível
        "imagem": "https://example.com/images/camiseta-polo-casual.jpg"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/products",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_product)
        )
        print(f"Create Status: {response.status_code}")
        if response.status_code == 201:
            created_product = response.json()
            print(f"✅ Produto criado com ID: {created_product['id']}")
            product_id = created_product['id']
        else:
            print(f"Response: {response.json()}")
            return
    except Exception as e:
        print(f"❌ Erro ao criar produto: {e}")
        return
    
    # 2. Listar produtos
    print("\n2. Listando produtos...")
    try:
        response = requests.get(f"{BASE_URL}/products")
        print(f"List Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Encontrados {data['pagination']['total']} produtos")
            for prod in data['items']:
                print(f"   - {prod['titulo']}: R$ {prod['preco']} ({prod['categoria']})")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro ao listar produtos: {e}")
    
    # 3. Buscar produtos por categoria
    if categories:
        categoria_teste = categories[0]['name']
        print(f"\n3. Buscando produtos da categoria '{categoria_teste}'...")
        try:
            response = requests.get(f"{BASE_URL}/products/category/{categoria_teste}")
            print(f"Category Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Encontrados {data['pagination']['total']} produtos na categoria")
            else:
                print(f"Response: {response.json()}")
        except Exception as e:
            print(f"❌ Erro ao buscar por categoria: {e}")
    
    # 4. Buscar produto específico
    print(f"\n4. Buscando produto ID {product_id}...")
    try:
        response = requests.get(f"{BASE_URL}/products/{product_id}")
        print(f"Get Status: {response.status_code}")
        if response.status_code == 200:
            product = response.json()
            print(f"✅ Produto encontrado: {product['titulo']}")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro ao buscar produto: {e}")
    
    # 5. Atualizar produto
    print(f"\n5. Atualizando produto ID {product_id}...")
    update_data = {
        "preco": 39.90,
        "descricao": "Camiseta polo em algodão 100%, perfeita para o dia a dia. Cor azul marinho, tamanho M. PROMOÇÃO!"
    }
    try:
        response = requests.put(
            f"{BASE_URL}/products/{product_id}",
            headers={"Content-Type": "application/json"},
            data=json.dumps(update_data)
        )
        print(f"Update Status: {response.status_code}")
        if response.status_code == 200:
            updated_product = response.json()
            print(f"✅ Produto atualizado: R$ {updated_product['preco']}")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro ao atualizar produto: {e}")

def test_validation():
    """Testa as validações implementadas."""
    print("\n🔒 Testando Validações...")
    
    # 1. Produto sem campos obrigatórios
    print("1. Testando produto sem campos obrigatórios...")
    invalid_product = {
        "titulo": "Teste"
        # Faltam: descricao, preco, categoria, imagem
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/products",
            headers={"Content-Type": "application/json"},
            data=json.dumps(invalid_product)
        )
        print(f"Validation Status: {response.status_code}")
        if response.status_code == 400:
            errors = response.json()
            print(f"✅ Validação funcionando: {len(errors.get('errors', {}))} erros detectados")
            for field, error in errors.get('errors', {}).items():
                print(f"   - {field}: {error}")
        else:
            print(f"❌ Deveria retornar erro 400, mas retornou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro no teste de validação: {e}")
    
    # 2. Produto com categoria inválida
    print("\n2. Testando categoria inválida...")
    invalid_category_product = {
        "titulo": "Produto Teste",
        "descricao": "Descrição do produto teste",
        "preco": 29.90,
        "categoria": "CategoriaInexistente",
        "imagem": "https://example.com/image.jpg"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/products",
            headers={"Content-Type": "application/json"},
            data=json.dumps(invalid_category_product)
        )
        print(f"Category Validation Status: {response.status_code}")
        if response.status_code == 400:
            print("✅ Validação de categoria funcionando")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Erro no teste de categoria: {e}")

def main():
    """Executa todos os testes."""
    print("🚀 Iniciando testes das APIs do Luxus Brechó\n")
    
    # Teste de conectividade
    if not test_health():
        print("❌ Servidor não está respondendo. Verifique se o backend está rodando.")
        sys.exit(1)
    
    # Testes de categorias
    categories = test_categories()
    
    # Testes de produtos
    test_products(categories)
    
    # Testes de validação
    test_validation()
    
    print("\n✅ Testes concluídos!")
    print("\nPara rodar o backend:")
    print("cd backend && python run.py")
    print("\nConfigure seu .env com as credenciais do MongoDB Atlas.")

if __name__ == "__main__":
    main()
