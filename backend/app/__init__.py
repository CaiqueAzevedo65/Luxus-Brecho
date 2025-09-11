# python
from flask import Flask
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure
from pymongo.server_api import ServerApi
import os
import certifi
from dotenv import load_dotenv
from flask_cors import CORS

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

def _should_use_tls(uri: str) -> bool:
    """Define se deve usar TLS/CA (Atlas / SRV / URIs com tls=true)."""
    if not uri:
        return False
    uri_l = uri.lower()
    return (
        uri_l.startswith("mongodb+srv://")
        or "mongodb.net" in uri_l
        or "tls=true" in uri_l
        or "ssl=true" in uri_l
    )

def create_app():
    """Função para criar e configurar a aplicação Flask"""
    app = Flask(__name__)

    # CORS restrito para as rotas da API
    allowed_origins_env = os.getenv("FRONTEND_ORIGIN")
    allowed_origins = (
        [o.strip() for o in allowed_origins_env.split(",")]
        if allowed_origins_env
        else [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:19000",  # Expo DevTools
            "http://localhost:8081",   # Expo Metro
        ]
    )
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    # Inicializa refs ao Mongo
    app.mongo = None
    app.db = None

    # URI e nome do DB (opcional em ambiente de teste)
    uri = os.getenv("MONGODB_URI")
    db_name_env = os.getenv("MONGODB_DATABASE")

    if not uri:
        # Não falhar em ambiente de testes; app será criado sem conexão ao DB
        print("Aviso: MONGODB_URI não configurado; inicializando app sem conexão ao DB (modo teste/dev).")
    else:
        client_kwargs = dict(
            serverSelectionTimeoutMS=int(os.getenv("MONGO_SERVER_SELECTION_MS", "15000")),
            connectTimeoutMS=int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "20000")),
            socketTimeoutMS=int(os.getenv("MONGO_SOCKET_TIMEOUT_MS", "20000")),
            maxPoolSize=int(os.getenv("MONGO_MAX_POOL_SIZE", "50")),
            retryWrites=True,
            server_api=ServerApi("1"),
            appname=os.getenv("MONGO_APPNAME", "Luxus-Brecho-Backend"),
        )

        if _should_use_tls(uri):
            client_kwargs["tlsCAFile"] = certifi.where()

        client = MongoClient(uri, **client_kwargs)

        try:
            client.admin.command("ping")
            print("MongoDB conectado com sucesso!")
            app.mongo = client

            if db_name_env:
                app.db = client[db_name_env]
            else:
                app.db = client.get_database()

            # Imports locais para evitar import circular e só executar se tivermos DB
            from .models.category_model import ensure_categories_collection, seed_default_categories
            from .models.product_model import ensure_products_collection

            ensure_categories_collection(app.db)
            seed_default_categories(app.db)
            ensure_products_collection(app.db)

        except (ConnectionFailure, ServerSelectionTimeoutError, OperationFailure) as e:
            # Não encerramos a criação do app — em testes a app pode ficar sem DB
            print(f"Erro ao conectar ao MongoDB: {e}")
            print("Continuando sem DB. Verifique MONGODB_URI, rede/IP e SSL.")

    # Configurações do Flask
    app.config["DEBUG"] = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    # Blueprints (imports locais para evitar import circular)
    from app.routes.health_routes import health_bp
    from app.routes.products_routes import products_bp
    from app.routes.categories_routes import categories_bp
    from app.routes.images_routes import images_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(images_bp, url_prefix="/api/images")

    return app