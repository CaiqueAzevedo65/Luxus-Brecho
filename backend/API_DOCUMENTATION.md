# API Documentation - Luxus Brechó

## Visão Geral

Esta documentação descreve as APIs REST implementadas para o sistema de categorias e produtos do Luxus Brechó. O backend utiliza Flask com MongoDB Atlas para persistência de dados.

## Base URL

```
http://localhost:5000/api
```

## Autenticação

Atualmente, as APIs não requerem autenticação (desenvolvimento).

---

## 🏥 Health Check

### GET /health

Verifica o status do servidor e conectividade com o banco de dados.

**Response:**
```json
{
  "status": "UP" | "DOWN",
  "timestamp": "2024-01-01T12:00:00Z",
  "database": "connected" | "disconnected"
}
```

---

## 📁 Categorias

### GET /categories

Lista todas as categorias com paginação e filtros.

**Query Parameters:**
- `page` (int, default: 1): Página atual
- `page_size` (int, default: 10, max: 100): Itens por página
- `active_only` (bool, default: false): Filtrar apenas categorias ativas

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Casual",
      "description": "Roupas para o dia a dia, confortáveis e descontraídas",
      "active": true
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 3
  }
}
```

### GET /categories/summary

Retorna resumo das categorias ativas (para uso em outros endpoints).

**Response:**
```json
[
  {
    "id": 1,
    "name": "Casual",
    "description": "Roupas para o dia a dia, confortáveis e descontraídas"
  }
]
```

### GET /categories/{id}

Busca uma categoria específica por ID.

**Response:**
```json
{
  "id": 1,
  "name": "Casual",
  "description": "Roupas para o dia a dia, confortáveis e descontraídas",
  "active": true
}
```

### POST /categories

Cria uma nova categoria.

**Request Body:**
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da nova categoria",
  "active": true
}
```

**Validações:**
- `name`: obrigatório, 2-50 caracteres, único
- `description`: obrigatório, 5-200 caracteres
- `active`: opcional, default: true

### PUT /categories/{id}

Atualiza uma categoria existente.

**Request Body:** (campos opcionais)
```json
{
  "name": "Categoria Atualizada",
  "description": "Nova descrição",
  "active": false
}
```

### DELETE /categories/{id}

Desativa uma categoria (soft delete). Não permite deletar se houver produtos associados.

**Response:**
```json
{
  "message": "category deactivated"
}
```

### PUT /categories/{id}/activate

Reativa uma categoria desativada.

### POST /categories/seed

Cria as categorias padrão do sistema (Casual, Social, Esportivo).

---

## 🛍️ Produtos

### GET /products

Lista todos os produtos com paginação, filtros e busca.

**Query Parameters:**
- `page` (int, default: 1): Página atual
- `page_size` (int, default: 10, max: 100): Itens por página
- `categoria` (string): Filtrar por categoria específica
- `q` (string): Busca textual em título e descrição

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "titulo": "Camiseta Polo Casual",
      "descricao": "Camiseta polo em algodão 100%",
      "preco": 45.90,
      "categoria": "Casual",
      "imagem": "https://example.com/image.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 25
  }
}
```

### GET /products/{id}

Busca um produto específico por ID.

### GET /products/category/{categoria}

Lista produtos de uma categoria específica com paginação.

**Query Parameters:**
- `page` (int, default: 1)
- `page_size` (int, default: 20, max: 100)

### POST /products

Cria um novo produto.

**Request Body:**
```json
{
  "titulo": "Nome do Produto",
  "descricao": "Descrição detalhada do produto",
  "preco": 29.90,
  "categoria": "Casual",
  "imagem": "https://example.com/image.jpg"
}
```

**Validações Obrigatórias:**
- `titulo`: obrigatório, 2-100 caracteres
- `descricao`: obrigatório, 10-500 caracteres
- `preco`: obrigatório, numérico, >= 0
- `categoria`: obrigatório, deve existir e estar ativa
- `imagem`: obrigatório, URL válida

### PUT /products/{id}

Atualiza um produto existente (merge parcial).

### DELETE /products/{id}

Remove um produto permanentemente.

---

## 🔒 Validações e Regras de Negócio

### Produtos
1. **Todos os campos são obrigatórios** - não é possível criar produto sem:
   - Título
   - Descrição
   - Preço
   - Categoria
   - Imagem

2. **Categoria deve existir e estar ativa** - o sistema valida dinamicamente
3. **Produtos são únicos** - não há controle de quantidade (brechó)
4. **Imagem obrigatória** - cada produto deve ter pelo menos uma imagem
5. **Preços devem ser positivos**

### Categorias
1. **Categorias padrão**: Casual, Social, Esportivo
2. **Nomes únicos** - não pode haver categorias com mesmo nome
3. **Soft delete** - categorias são desativadas, não removidas
4. **Proteção de integridade** - não permite deletar categoria com produtos

---

## 🗂️ Estrutura do Banco de Dados

### Coleção: categories
```json
{
  "id": 1,
  "name": "Casual",
  "description": "Roupas para o dia a dia",
  "active": true
}
```

### Coleção: products
```json
{
  "id": 1,
  "titulo": "Produto",
  "descricao": "Descrição",
  "preco": 29.90,
  "categoria": "Casual",
  "imagem": "https://example.com/image.jpg"
}
```

### Coleção: counters
```json
{
  "name": "products" | "categories",
  "seq": 1
}
```

---

## 🚀 Como Usar

### 1. Configuração
1. Configure MongoDB Atlas no arquivo `.env`
2. Execute: `cd backend && python run.py`

### 2. Inicialização
```bash
# Criar categorias padrão
curl -X POST http://localhost:5000/api/categories/seed

# Verificar categorias
curl http://localhost:5000/api/categories/summary
```

### 3. Exemplo de Criação de Produto
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Jaqueta Jeans Casual",
    "descricao": "Jaqueta jeans azul, tamanho M, em excelente estado",
    "preco": 89.90,
    "categoria": "Casual",
    "imagem": "https://example.com/jaqueta.jpg"
  }'
```

---

## 📱 Integração Mobile

O mobile (React Native) utiliza:
- **TypeScript types** em `/types/category.ts` e `/types/product.ts`
- **Zustand stores** em `/store/categoryStore.js` e `/store/productStore.js`
- **API Service** em `/services/api.ts`

### Exemplo de Uso no Mobile
```javascript
import useCategoryStore from '../store/categoryStore';
import useProductStore from '../store/productStore';

// Buscar categorias
const { fetchCategories, categories } = useCategoryStore();
await fetchCategories();

// Buscar produtos por categoria
const { fetchProductsByCategory } = useProductStore();
await fetchProductsByCategory('Casual');
```

---

## 🧪 Testes

Execute o script de testes:
```bash
cd backend
python test_apis.py
```

O script testa:
- ✅ Conectividade com o servidor
- ✅ Criação de categorias padrão
- ✅ CRUD de produtos
- ✅ Validações obrigatórias
- ✅ Filtros e busca

---

## 📝 Códigos de Status

- `200` - OK
- `201` - Created
- `400` - Bad Request (validação)
- `404` - Not Found
- `409` - Conflict (duplicata)
- `500` - Internal Server Error
- `503` - Service Unavailable (banco offline)

---

## 🔄 Próximos Passos

1. Implementar autenticação/autorização
2. Upload de imagens para cloud storage
3. Sistema de avaliações/reviews
4. Carrinho de compras
5. Sistema de pedidos
6. Integração com pagamentos
