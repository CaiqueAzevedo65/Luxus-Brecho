from flask import Blueprint
from app.controllers.health_controller import check_health

# Cria blueprint para rotas de verificação de saúde
health_bp = Blueprint('health', __name__, url_prefix='/api')

# Registra as rotas
# Rota GET /api/health: Verifica o status de funcionamento da API
health_bp.route('/health', methods=['GET'])(check_health)
