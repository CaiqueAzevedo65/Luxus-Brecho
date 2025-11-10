import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure
from pymongo.server_api import ServerApi
import certifi
from dotenv import load_dotenv

def _should_use_tls(uri: str) -> bool:
    """Define se deve usar TLS/CA (Atlas / SRV / URIs com tls=true)."""
    if not uri:
        return False
    uri_l = uri.lower()
    return (
        uri_l.startswith("mongodb+srv://") or
        "mongodb.net" in uri_l or
        "tls=true" in uri_l or
        "ssl=true" in uri_l
    )

def create_app():
    """Factory function para criar a aplicação Flask"""
    
    # Carrega variáveis de ambiente
    load_dotenv()
    
    # Cria a instância Flask
    app = Flask(__name__)
    
    # Configurações básicas
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))  # 16MB
    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.config['PROPAGATE_EXCEPTIONS'] = True  # Melhor tratamento de erros
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False  # Reduz tamanho do JSON
    
    # Configuração CORS unificada (web + mobile)
    allowed_origins_env = os.getenv("FRONTEND_ORIGIN")
    if allowed_origins_env:
        allowed_origins = [o.strip() for o in allowed_origins_env.split(",")]
    else:
        allowed_origins = [
            'http://localhost:5173',                          # Vite dev server
            'http://127.0.0.1:5173',                          # Vite dev server (IP)
            'http://localhost:19000',                         # Expo DevTools
            'http://localhost:8081',                          # Expo Metro
            'https://luxus-brechofrontend.vercel.app',       # Frontend Vercel
            'https://luxus-brecho-frontend.vercel.app',      # Frontend Vercel (alternativo)
        ]
    
    print(f"🌐 Origens CORS permitidas: {allowed_origins}")
    
    CORS(app, 
         origins=allowed_origins,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
         allow_headers=[
             'Content-Type', 
             'Authorization',
             'Accept',
             'Accept-Encoding',
             'X-Client-Version',
             'X-Requested-With',
             'Origin'
         ],
         expose_headers=['Content-Length', 'Content-Encoding'],
         max_age=3600,
         supports_credentials=True,
         send_wildcard=False,
         always_send=True)
    
    # Middleware de segurança
    @app.after_request
    def after_request(response):
        # Headers de segurança
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'  # Permite iframe do mesmo domínio
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Não adicionar headers CORS aqui - já configurado pelo flask-cors
        
        return response
    
    # Inicializa MongoDB
    app.mongo = None
    app.db = None
    
    # Configuração do MongoDB
    uri = os.getenv("MONGODB_URI")
    if uri:
        try:
            db_name_env = os.getenv("MONGODB_DATABASE")
            
            # Configurações de conexão
            client_kwargs = dict(
                serverSelectionTimeoutMS=int(os.getenv("MONGO_SERVER_SELECTION_MS", "15000")),
                connectTimeoutMS=int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "20000")),
                socketTimeoutMS=int(os.getenv("MONGO_SOCKET_TIMEOUT_MS", "20000")),
                maxPoolSize=int(os.getenv("MONGO_MAX_POOL_SIZE", "50")),
                retryWrites=True,
                server_api=ServerApi("1"),
                appname=os.getenv("MONGO_APPNAME", "Luxus-Brecho-Backend"),
            )
            
            # Usa CA apenas quando faz sentido (Atlas/SRV/TLS)
            if _should_use_tls(uri):
                client_kwargs["tlsCAFile"] = certifi.where()
            
            client = MongoClient(uri, **client_kwargs)
            
            # Testa conexão
            client.admin.command("ping")
            print("✅ MongoDB conectado com sucesso!")
            app.mongo = client
            
            # Define database
            if db_name_env:
                app.db = client[db_name_env]
            else:
                app.db = client.get_database()
            
            # Garantia de índices/esquemas
            try:
                from .models.category_model import ensure_categories_collection
                from .models.product_model import ensure_products_collection
                from .models.user_model import ensure_users_collection
                
                ensure_categories_collection(app.db)
                ensure_products_collection(app.db)
                ensure_users_collection(app.db)
                print("✅ Coleções e índices verificados")
            except ImportError as e:
                print(f"⚠️  Alguns modelos não foram encontrados: {e}")
                
        except (ConnectionFailure, ServerSelectionTimeoutError, OperationFailure) as e:
            print(f"❌ Erro ao conectar ao MongoDB: {e}")
            print("Verifique MONGODB_URI, rede/IP liberado no Atlas")
        except Exception as e:
            print(f"❌ Erro inesperado na conexão MongoDB: {e}")
    else:
        print("⚠️  MONGODB_URI não configurado - funcionando sem banco")
    
    # Rota raiz
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'message': 'Luxus Brechó API está funcionando!',
            'version': '1.0.0',
            'status': 'online',
            'database': 'connected' if app.db is not None else 'disconnected',

            'endpoints': {
                'health': '/api/health',
                'products': '/api/products',
                'images': '/api/images',
                'users': '/api/users'
            }
        })
    
    # Registra os blueprints (rotas) - com tratamento de erro
    blueprints_to_register = [
        ('app.routes.health_routes', 'health_bp', '/api'),
        ('app.routes.products_routes', 'products_bp', '/api/products'),
        ('app.routes.categories_routes', 'categories_bp', '/api/categories'),
        ('app.routes.images_routes', 'images_bp', '/api/images'),
        ('app.routes.users_routes', 'users_bp', '/api/users')
    ]
    
    for module_path, blueprint_name, url_prefix in blueprints_to_register:
        try:
            module = __import__(module_path, fromlist=[blueprint_name])
            blueprint = getattr(module, blueprint_name)
            app.register_blueprint(blueprint, url_prefix=url_prefix)
            print(f"✅ {blueprint_name} registrado em {url_prefix}")
        except ImportError as e:
            print(f"⚠️  Erro ao importar {module_path}: {e}")
        except AttributeError as e:
            print(f"⚠️  Blueprint {blueprint_name} não encontrado em {module_path}: {e}")
        except Exception as e:
            print(f"❌ Erro inesperado ao registrar {blueprint_name}: {e}")
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint não encontrado',
            'available_endpoints': [
                'GET /',
                'GET /api/health',
                'GET /api/products',
                'POST /api/products',
                'PUT /api/products/<id>',
                'DELETE /api/products/<id>',
                'GET /api/categories',
                'POST /api/categories',
                'GET /api/users',
                'POST /api/users'
            ]
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(error) if app.config['DEBUG'] else 'Erro interno'
        }), 500
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'Método não permitido para este endpoint'
        }), 405
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            'success': False,
            'message': 'Arquivo muito grande',
            'max_size': '16MB'
        }), 413
    
    print("🚀 Aplicação Flask criada com sucesso!")
    
    return app