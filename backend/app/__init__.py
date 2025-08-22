from flask import Flask, jsonify
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

def create_app():
    """Função para criar e configurar a aplicação Flask"""
    app = Flask(__name__)
    
    # Configuração do cliente MongoDB usando variáveis de ambiente
    # Se existir usuário e senha configurados, usa autenticação
    if os.getenv("MONGODB_USERNAME") and os.getenv("MONGODB_PASSWORD"):
        uri = f"mongodb://{os.getenv('MONGODB_USERNAME')}:{os.getenv('MONGODB_PASSWORD')}@{os.getenv('MONGODB_HOST')}/?retryWrites=true&w=majority&appName=Cluster0"
    else:
        # Caso contrário, usa conexão sem autenticação
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    
    # Cria o cliente MongoDB com timeout para evitar bloqueio prolongado
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    
    # Verifica se a conexão com o banco de dados foi estabelecida
    try:
        # O comando ping verifica a conexão com o servidor
        client.admin.command('ping')
        print("MongoDB conectado com sucesso!")
        app.mongo = client
        app.db = client[os.getenv("MONGODB_DATABASE", "luxus_brecho_db")]
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        print("Verifique as configurações no arquivo .env e se o servidor MongoDB está em execução.")
        sys.exit(1)  # Encerra a aplicação com código de erro

    # Configurações do Flask a partir de variáveis de ambiente
    app.config["DEBUG"] = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    # Registra os blueprints (conjuntos de rotas)
    from app.routes.health_routes import health_bp
    app.register_blueprint(health_bp)

    return app
