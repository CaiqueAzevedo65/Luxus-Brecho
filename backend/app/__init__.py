from flask import Flask, jsonify
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure
import os
import sys
from dotenv import load_dotenv
from flask_cors import CORS
from app.models.product_model import ensure_products_collection

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

def create_app():
    """Função para criar e configurar a aplicação Flask"""
    app = Flask(__name__)
    # Habilita CORS restrito para as rotas da API
    allowed_origins_env = os.getenv("FRONTEND_ORIGIN")
    if allowed_origins_env:
        allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    else:
        allowed_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
    
    # Inicializa referências ao Mongo como None; serão preenchidas se conexão for bem-sucedida
    app.mongo = None
    app.db = None
    
    # Configuração do cliente MongoDB usando variáveis de ambiente
    # Preferir MONGODB_URI; caso contrário, montar URI apenas se USER/PASS/HOST estiverem presentes
    uri = os.getenv("MONGODB_URI")
    if not uri:
        username = os.getenv("MONGODB_USERNAME")
        password = os.getenv("MONGODB_PASSWORD")
        host = os.getenv("MONGODB_HOST")
        if username and password and host:
            uri = f"mongodb://{username}:{password}@{host}/?retryWrites=true&w=majority&appName=Cluster0"
        else:
            # Fallback local
            uri = "mongodb://localhost:27017"
    
    # Cria o cliente MongoDB com timeout para evitar bloqueio prolongado
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    
    # Verifica se a conexão com o banco de dados foi estabelecida
    try:
        # O comando ping verifica a conexão com o servidor
        client.admin.command('ping')
        print("MongoDB conectado com sucesso!")
        app.mongo = client
        app.db = client[os.getenv("MONGODB_DATABASE", "luxus_brecho_db")]
        # Garante schema/índices da coleção de produtos
        ensure_products_collection(app.db)
    except (ConnectionFailure, ServerSelectionTimeoutError, OperationFailure) as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        print("Verifique as configurações no arquivo .env e se o servidor MongoDB está em execução.")
        # Não encerra a aplicação: mantém app.mongo/app.db como None para que /api/health reporte DOWN

    # Configurações do Flask a partir de variáveis de ambiente
    app.config["DEBUG"] = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    # Registra os blueprints (conjuntos de rotas)
    from app.routes.health_routes import health_bp
    from app.routes.products_routes import products_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(products_bp)

    return app
