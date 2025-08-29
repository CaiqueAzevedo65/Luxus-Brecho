# Backend - Luxus Brechó

Backend em Flask com MongoDB (PyMongo) e configuração via dotenv.

## Requisitos
- Python 3.10+
- Pip
- MongoDB local (opcional, se utilizar Atlas basta fornecer a URI)

## Instalação
```powershell
# (Opcional) criar e ativar venv no Windows
python -m venv venv
venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt
```

## Configuração (.env)
O backend carrega variáveis de ambiente com `python-dotenv` em `app/__init__.py`.

Crie o arquivo `backend/.env` (já existe um exemplo em `.env.example`). Exemplo para ambiente local:
```ini
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=luxus_brecho_db
FLASK_DEBUG=False
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Exemplo para MongoDB Atlas (recomendado em produção):
```ini
MONGODB_URI=mongodb+srv://<USUARIO>:<SENHA>@<HOST>/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DATABASE=luxus_brecho_db
FLASK_DEBUG=False
FRONTEND_ORIGIN=https://www.seu-dominio.com
```

Observações:
- A aplicação prioriza `MONGODB_URI`. Não é necessário definir `MONGODB_USERNAME`/`MONGODB_PASSWORD`/`MONGODB_HOST`.
- `FLASK_DEBUG` controla o modo debug. O `run.py` lê esse valor via `app.config["DEBUG"]`.
- Não versione o `.env`. O `.gitignore` já ignora esse arquivo.

## Executando
```powershell
# a partir da pasta raiz do repositório
python backend/run.py
```

Aplicação por padrão em: `http://localhost:5000`

## Healthcheck
- `GET /api/health` — retorna status da API e do banco de dados (`UP`/`DOWN`).

## Postman
- Coleção: `backend/postman/Luxus-Brecho.postman_collection.json`
- Ambiente (local): `backend/postman/Luxus-Brecho.local.postman_environment.json`

Como usar:
1. Abra o Postman.
2. Importe a coleção e o ambiente pelos arquivos acima.
3. Selecione o ambiente "Luxus Brechó - Local" (baseUrl = `http://localhost:5000`).
4. Execute a requisição "GET /api/health". A coleção inclui testes que validam:
   - Código 200 ou 503
   - Presença de `api_status` e `database_status`

Ambiente de produção (opcional):
- Crie um novo ambiente no Postman com `baseUrl = https://api.seu-dominio.com` (ou a URL do backend).

### Import rápido (Postman → Import → Raw Text)
Cole os cURLs abaixo no Postman para criar rapidamente as requisições:
```bash
# Health
curl --request GET \
  --url http://localhost:5000/api/health

# Listar produtos (com paginação opcional)
curl --request GET \
  --url "http://localhost:5000/api/products?page=1&page_size=10"

# Filtrar por categoria
curl --request GET \
  --url "http://localhost:5000/api/products?categoria=Casual"

# Buscar por texto (usa índice de texto em título/descrição)
curl --request GET \
  --url "http://localhost:5000/api/products?q=floral"

# Criar produto
curl --request POST \
  --url http://localhost:5000/api/products \
  --header 'Content-Type: application/json' \
  --data '{
    "titulo": "Camisa Floral Feminina",
    "preco": 89.90,
    "descricao": "Camisa leve com estampa floral, tamanho M.",
    "categoria": "Casual",
    "imagem": "https://storage.supabase.co/bucket/produtos/camisa-floral.jpg"
  }'

# Obter produto por id
curl --request GET \
  --url http://localhost:5000/api/products/1

# Atualizar produto por id
curl --request PUT \
  --url http://localhost:5000/api/products/1 \
  --header 'Content-Type: application/json' \
  --data '{
    "titulo": "Camisa Floral Feminina - Nova Edição",
    "preco": 95.90,
    "descricao": "Camisa leve com estampa floral, tamanho M (ajustada).",
    "categoria": "Casual",
    "imagem": "https://storage.supabase.co/bucket/produtos/camisa-floral-v2.jpg"
  }'

# Excluir produto por id
curl --request DELETE \
  --url http://localhost:5000/api/products/1
```

## Estrutura de pastas (resumo)
```
backend/
  app/
    __init__.py        # application factory, carrega .env e conecta ao Mongo
    routes/
      health_routes.py # blueprint /api/health
    controllers/
      health_controller.py
  run.py               # entrada; usa app.config["DEBUG"]
  requirements.txt
  .env.example
  .env                 # (não versionar)
```

## Notas
- CORS: restrito às origens definidas via `flask-cors` para rotas `/api/*`.
- Padrão: http://localhost:5173 e http://127.0.0.1:5173. Personalize com `FRONTEND_ORIGIN` (múltiplas origens separadas por vírgulas).
- Proxy Vite: mapeado `'/api' -> 'http://localhost:5000'` em `frontend/vite.config.js`.
- Se você acidentalmente versionou credenciais no passado, altere (rotate) as chaves/senhas no provedor.
- Para logs de conexão com o MongoDB, veja a saída do terminal ao iniciar a aplicação.
