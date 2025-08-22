from flask import jsonify, current_app
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

def check_health():
    """Função de controle para verificação de saúde da API e do banco de dados
    
    Returns:
        tuple: Resposta JSON com status da API, status do banco de dados e código HTTP
    """
    mongo_status = "UP"
    status_code = 200
    
    # Verifica conexão com o MongoDB
    if current_app.mongo is None:
        # Conexão não estabelecida na inicialização
        mongo_status = "DOWN"
        status_code = 503  # Service Unavailable
    else:
        try:
            # Usa o cliente MongoDB para executar um comando de ping no servidor
            current_app.mongo.admin.command('ping')
        except (ConnectionFailure, ServerSelectionTimeoutError):
            mongo_status = "DOWN"
            status_code = 503  # Service Unavailable
    
    return jsonify(
        api_status='UP',
        database_status=mongo_status
    ), status_code
