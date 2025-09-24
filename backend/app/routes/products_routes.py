from flask import Blueprint, request, jsonify
from app.controllers.products_controller import ProductsController
from flask_cors import cross_origin
import traceback

# Cria o blueprint das rotas de produtos
products_bp = Blueprint('products', __name__)

# Configura o controlador
controller = ProductsController()

@products_bp.route('/products', methods=['GET'], strict_slashes=False)
@cross_origin()
def get_products():
    """Lista todos os produtos"""
    try:
        print(f"GET /api/products - Requisição recebida")
        products = controller.get_all_products()
        return jsonify({
            'success': True,
            'data': products,
            'count': len(products)
        }), 200
    except Exception as e:
        print(f"Erro em GET /api/products: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@products_bp.route('/products/<int:product_id>', methods=['GET'], strict_slashes=False)
@cross_origin()
def get_product(product_id):
    """Busca um produto específico"""
    try:
        print(f"GET /api/products/{product_id} - Requisição recebida")
        product = controller.get_product_by_id(product_id)
        if product:
            return jsonify({
                'success': True,
                'data': product
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Produto não encontrado'
            }), 404
    except Exception as e:
        print(f"Erro em GET /api/products/{product_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@products_bp.route('/products', methods=['POST'], strict_slashes=False)
@cross_origin()
def create_product():
    """Cria um novo produto"""
    try:
        print("POST /api/products - Requisição recebida")
        
        # Verifica se é JSON
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Content-Type deve ser application/json'
            }), 400
        
        data = request.get_json()
        print(f"Dados recebidos: {data}")
        
        # Validação básica dos campos obrigatórios
        required_fields = ['titulo', 'preco', 'descricao', 'categoria']
        for field in required_fields:
            if not data or field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'message': f'Campo obrigatório: {field}',
                    'received_data': data
                }), 400
        
        # Cria o produto usando o controlador
        product = controller.create_product(data)
        
        return jsonify({
            'success': True,
            'message': 'Produto criado com sucesso',
            'data': product
        }), 201
        
    except ValueError as e:
        print(f"Erro de validação em POST /api/products: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"Erro em POST /api/products: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@products_bp.route('/products/<int:product_id>', methods=['PUT'], strict_slashes=False)
@cross_origin()
def update_product(product_id):
    """Atualiza um produto existente"""
    try:
        print(f"PUT /api/products/{product_id} - Requisição recebida")
        
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Content-Type deve ser application/json'
            }), 400
        
        data = request.get_json()
        print(f"Dados recebidos: {data}")
        
        # Validação básica dos campos obrigatórios
        required_fields = ['titulo', 'preco', 'descricao', 'categoria']
        for field in required_fields:
            if not data or field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'message': f'Campo obrigatório: {field}',
                    'received_data': data
                }), 400
        
        # Atualiza o produto
        product = controller.update_product(product_id, data)
        
        if product:
            return jsonify({
                'success': True,
                'message': 'Produto atualizado com sucesso',
                'data': product
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Produto não encontrado'
            }), 404
            
    except ValueError as e:
        print(f"Erro de validação em PUT /api/products/{product_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"Erro em PUT /api/products/{product_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@products_bp.route('/products/<int:product_id>', methods=['DELETE'], strict_slashes=False)
@cross_origin()
def delete_product(product_id):
    """Deleta um produto"""
    try:
        print(f"DELETE /api/products/{product_id} - Requisição recebida")
        
        success = controller.delete_product(product_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Produto deletado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Produto não encontrado'
            }), 404
            
    except Exception as e:
        print(f"Erro em DELETE /api/products/{product_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

# Rota adicional para lidar com OPTIONS (preflight CORS)
@products_bp.route('/products', methods=['OPTIONS'], strict_slashes=False)
@products_bp.route('/products/<int:product_id>', methods=['OPTIONS'], strict_slashes=False)
@cross_origin()
def handle_options(product_id=None):
    """Lida com requisições OPTIONS para CORS preflight"""
    print(f"OPTIONS /api/products{('/' + str(product_id)) if product_id else ''} - Preflight CORS")
    return jsonify({'message': 'OK'}), 200