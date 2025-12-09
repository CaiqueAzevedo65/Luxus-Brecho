# Luxus Brechó — Backend

API REST Flask + MongoDB com autenticação JWT e serviço de emails.

## 🚀 Início Rápido

```bash
pip install -r requirements.txt
cp .env.example .env  # Configure as variáveis
python run.py         # http://localhost:5000/api
```

## ⚙️ Configuração (.env)

```ini
# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=luxus_brecho_db

# JWT (IMPORTANTE: mude em produção!)
JWT_SECRET_KEY=sua-chave-secreta-32-chars-minimo
JWT_ALGORITHM=HS256

# Flask
FLASK_DEBUG=True
FRONTEND_ORIGIN=http://localhost:5173

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app
```

## 📂 Estrutura

```
app/
├─ routes/       # Blueprints (products, users, orders...)
├─ controllers/  # Lógica de negócio
├─ services/     # JWT, Email, Supabase
└─ __init__.py   # App factory
```

## 🔐 Autenticação JWT

Rotas protegidas usam decorators:
- `@jwt_required` - Requer token válido
- `@admin_required` - Requer role admin

Headers: `Authorization: Bearer <token>`

## 📌 Principais Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| POST | `/api/users/auth` | Login (retorna tokens) |
| POST | `/api/users` | Registro |
| GET | `/api/products` | Listar produtos |
| POST | `/api/products` | Criar produto (admin) |

## 🧪 Testes

```bash
pytest
pytest -v  # Verbose
```

## 📦 Dependências Principais

- **Flask** + **Flask-CORS**
- **PyMongo** (MongoDB)
- **PyJWT** (autenticação)
- **python-dotenv** (configuração)
- **pytest** (testes)
