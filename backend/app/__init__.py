import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    """Factory function para criar a aplicação Flask"""
    
    # Carrega variáveis de ambiente
    load_dotenv()
    
    # Cria a instância Flask
    app = Flask(__name__)
    
    # Configurações básicas
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))  # 16MB
    
    # Configura CORS de forma mais permissiva para desenvolvimento
    CORS(app, 
         origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    
    # Middleware para adicionar headers CORS manualmente (backup)
    @app.after_request
    def after_request(response):
        origin = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
        response.headers.add('Access-Control-Allow-Origin', '*')  # Permissivo para dev
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Rota raiz
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'message': 'Luxus Brechó API está funcionando!',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'products': '/api/products',
                'categories': '/api/categories',
                'images': '/api/images'
            }
        })
    
    # Registra os blueprints (rotas)
    try:
        from app.routes.health_routes import health_bp
        app.register_blueprint(health_bp, url_prefix='/api')
        print("✅ Health routes registradas")
    except ImportError as e:
        print(f"⚠️  Erro ao importar health_routes: {e}")
    
    try:
        from app.routes.products_routes import products_bp
        app.register_blueprint(products_bp, url_prefix='/api')
        print("✅ Products routes registradas")
    except ImportError as e:
        print(f"⚠️  Erro ao importar products_routes: {e}")
    
    try:
        from app.routes.categories_routes import categories_bp
        app.register_blueprint(categories_bp, url_prefix='/api')
        print("✅ Categories routes registradas")
    except ImportError as e:
        print(f"⚠️  Erro ao importar categories_routes: {e}")
    
    try:
        from app.routes.images_routes import images_bp
        app.register_blueprint(images_bp, url_prefix='/api')
        print("✅ Images routes registradas")
    except ImportError as e:
        print(f"⚠️  Erro ao importar images_routes: {e}")
    
    # Handler para 404
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
                'DELETE /api/products/<id>'
            ]
        }), 404
    
    # Handler para 500
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(error)
        }), 500
    
    # Handler para 405 (método não permitido)
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'Método não permitido para este endpoint'
        }), 405
    
    print("🚀 Aplicação Flask criada com sucesso!")
    
    return app