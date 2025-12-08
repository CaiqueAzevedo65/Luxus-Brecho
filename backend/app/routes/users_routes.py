from flask import Blueprint
from app.controllers.users_controller import (
    list_users,
    get_user,
    create_user,
    update_user,
    delete_user,
    authenticate_user,
    change_password,
    forgot_password,
    reset_password,
    get_user_types,
    get_users_summary,
    confirm_email,
    resend_confirmation_email,
    request_account_deletion,
    confirm_account_deletion,
)

users_bp = Blueprint("users", __name__)

# Rotas CRUD básicas
users_bp.route("/", methods=["GET"])(list_users)
users_bp.route("/<int:id>", methods=["GET"])(get_user)
users_bp.route("/", methods=["POST"])(create_user)
users_bp.route("/<int:id>", methods=["PUT"])(update_user)
users_bp.route("/<int:id>", methods=["DELETE"])(delete_user)

# Rotas de autenticação
users_bp.route("/auth", methods=["POST"])(authenticate_user)
users_bp.route("/<int:id>/change-password", methods=["PUT"])(change_password)

# Rotas de recuperação de senha
users_bp.route("/forgot-password", methods=["POST"])(forgot_password)
users_bp.route("/reset-password", methods=["POST"])(reset_password)

# Rotas de confirmação de email
users_bp.route("/confirm-email/<string:token>", methods=["GET"])(confirm_email)
users_bp.route("/resend-confirmation", methods=["POST"])(resend_confirmation_email)

# Rotas de informações
users_bp.route("/types", methods=["GET"])(get_user_types)
users_bp.route("/summary", methods=["GET"])(get_users_summary)

# Rotas de exclusão de conta
users_bp.route("/request-deletion", methods=["POST"])(request_account_deletion)
users_bp.route("/confirm-deletion", methods=["POST"])(confirm_account_deletion)
