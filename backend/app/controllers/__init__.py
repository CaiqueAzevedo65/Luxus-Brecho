from flask import Flask
from pymongo import MongoClient
import os

def create_app():
    app = Flask(__name__)
    
    # Configuração de debug
    app.config["DEBUG"] = True

    # Configura MongoDB
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    app.mongo = client["luxus_brecho"]

    # Importa blueprints
    from app.routes.health_routes import health_bp
    from app.routes.products_routes import products_bp

    # Registra blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(products_bp)

    return app
