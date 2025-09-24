from flask import request, jsonify, current_app
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from typing import Any, Dict
import time
from datetime import datetime

from ..models.user_model import (
    get_collection,
    prepare_new_user,
    prepare_user_update,
    validate_user_payload,
    normalize_user,
    verify_password,
    USER_TYPES,
)


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Serializa documento removendo campos internos."""
    if not doc:
        return {}
    return normalize_user(doc)


def list_users():
    """Lista usuários com paginação e filtros."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    coll = get_collection(db)

    try:
        # Parâmetros de paginação
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 20))
        
        # Parâmetros de filtro
        tipo = request.args.get("tipo")
        ativo = request.args.get("ativo")
        search = request.args.get("search")

        # Constrói filtro
        filter_query = {}
        
        if tipo and tipo in USER_TYPES:
            filter_query["tipo"] = tipo
        
        if ativo is not None:
            filter_query["ativo"] = ativo.lower() == "true"
        
        if search:
            filter_query["$or"] = [
                {"nome": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        # Contagem total
        total = coll.count_documents(filter_query)

        # Busca com paginação
        skip = (page - 1) * page_size
        cursor = coll.find(filter_query).sort("data_criacao", -1).skip(skip).limit(page_size)
        
        users = [_serialize(doc) for doc in cursor]

        return jsonify({
            "items": users,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total
            }
        })

    except ValueError as e:
        return jsonify(message=f"Parâmetros inválidos: {e}"), 400
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def get_user(id: int):
    """Busca usuário por ID."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    coll = get_collection(db)

    try:
        user = coll.find_one({"id": id})
        if not user:
            return jsonify(message="Usuário não encontrado"), 404

        return jsonify(_serialize(user))

    except Exception as e:
        print(f"Erro ao buscar usuário {id}: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def create_user():
    """Cria novo usuário."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        payload = request.get_json()
        if not payload:
            return jsonify(message="Payload JSON é obrigatório"), 400

        # Valida payload
        is_valid, error_msg = validate_user_payload(payload)
        if not is_valid:
            return jsonify(message=error_msg), 400

        coll = get_collection(db)

        # Verifica se email já existe
        existing_user = coll.find_one({"email": payload["email"].strip().lower()})
        if existing_user:
            return jsonify(message="Email já está em uso"), 409

        # Prepara dados do usuário
        user_data = prepare_new_user(payload, db)

        # Insere no banco
        result = coll.insert_one(user_data)
        
        # Busca usuário criado
        created_user = coll.find_one({"_id": result.inserted_id})
        
        return jsonify({
            "message": "Usuário criado com sucesso",
            "user": _serialize(created_user)
        }), 201

    except DuplicateKeyError as e:
        if "email" in str(e):
            return jsonify(message="Email já está em uso"), 409
        return jsonify(message="Dados duplicados"), 409
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def update_user(id: int):
    """Atualiza usuário existente."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        payload = request.get_json()
        if not payload:
            return jsonify(message="Payload JSON é obrigatório"), 400

        # Valida payload para atualização
        is_valid, error_msg = validate_user_payload(payload, is_update=True)
        if not is_valid:
            return jsonify(message=error_msg), 400

        coll = get_collection(db)

        # Verifica se usuário existe
        existing_user = coll.find_one({"id": id})
        if not existing_user:
            return jsonify(message="Usuário não encontrado"), 404

        # Verifica se email já está em uso por outro usuário
        if "email" in payload:
            email_check = coll.find_one({
                "email": payload["email"].strip().lower(),
                "id": {"$ne": id}
            })
            if email_check:
                return jsonify(message="Email já está em uso"), 409

        # Prepara dados para atualização
        update_data = prepare_user_update(payload)

        # Atualiza no banco
        result = coll.update_one(
            {"id": id},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify(message="Usuário não encontrado"), 404

        # Busca usuário atualizado
        updated_user = coll.find_one({"id": id})

        return jsonify({
            "message": "Usuário atualizado com sucesso",
            "user": _serialize(updated_user)
        })

    except DuplicateKeyError as e:
        if "email" in str(e):
            return jsonify(message="Email já está em uso"), 409
        return jsonify(message="Dados duplicados"), 409
    except Exception as e:
        print(f"Erro ao atualizar usuário {id}: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def delete_user(id: int):
    """Exclui usuário (soft delete - marca como inativo)."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        coll = get_collection(db)

        # Verifica se usuário existe
        existing_user = coll.find_one({"id": id})
        if not existing_user:
            return jsonify(message="Usuário não encontrado"), 404

        # Verifica se é o último administrador
        if existing_user.get("tipo") == "Administrador":
            admin_count = coll.count_documents({
                "tipo": "Administrador",
                "ativo": True,
                "id": {"$ne": id}
            })
            if admin_count == 0:
                return jsonify(message="Não é possível excluir o último administrador"), 400

        # Soft delete - marca como inativo
        result = coll.update_one(
            {"id": id},
            {"$set": {"ativo": False, "data_atualizacao": datetime.utcnow()}}
        )

        if result.matched_count == 0:
            return jsonify(message="Usuário não encontrado"), 404

        return jsonify(message="Usuário desativado com sucesso")

    except Exception as e:
        print(f"Erro ao excluir usuário {id}: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def authenticate_user():
    """Autentica usuário com email e senha."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        payload = request.get_json()
        if not payload:
            return jsonify(message="Payload JSON é obrigatório"), 400

        email = payload.get("email")
        senha = payload.get("senha")

        if not email or not senha:
            return jsonify(message="Email e senha são obrigatórios"), 400

        coll = get_collection(db)

        # Busca usuário por email
        user = coll.find_one({
            "email": email.strip().lower(),
            "ativo": True
        })

        if not user:
            return jsonify(message="Credenciais inválidas"), 401

        # Verifica senha
        if not verify_password(senha, user["senha_hash"]):
            return jsonify(message="Credenciais inválidas"), 401

        return jsonify({
            "message": "Autenticação realizada com sucesso",
            "user": _serialize(user)
        })

    except Exception as e:
        print(f"Erro na autenticação: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def change_password(id: int):
    """Altera senha do usuário."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        payload = request.get_json()
        if not payload:
            return jsonify(message="Payload JSON é obrigatório"), 400

        senha_atual = payload.get("senha_atual")
        senha_nova = payload.get("senha_nova")

        if not senha_atual or not senha_nova:
            return jsonify(message="Senha atual e nova senha são obrigatórias"), 400

        coll = get_collection(db)

        # Busca usuário
        user = coll.find_one({"id": id, "ativo": True})
        if not user:
            return jsonify(message="Usuário não encontrado"), 404

        # Verifica senha atual
        if not verify_password(senha_atual, user["senha_hash"]):
            return jsonify(message="Senha atual incorreta"), 400

        # Valida nova senha
        from ..models.user_model import validate_password, hash_password
        is_valid, error_msg = validate_password(senha_nova)
        if not is_valid:
            return jsonify(message=error_msg), 400

        # Atualiza senha
        result = coll.update_one(
            {"id": id},
            {"$set": {
                "senha_hash": hash_password(senha_nova),
                "data_atualizacao": datetime.utcnow()
            }}
        )

        if result.matched_count == 0:
            return jsonify(message="Usuário não encontrado"), 404

        return jsonify(message="Senha alterada com sucesso")

    except Exception as e:
        print(f"Erro ao alterar senha do usuário {id}: {e}")
        return jsonify(message="Erro interno do servidor"), 500


def get_user_types():
    """Retorna tipos de usuário disponíveis."""
    return jsonify({
        "types": USER_TYPES,
        "message": "Tipos de usuário disponíveis"
    })


def get_users_summary():
    """Retorna resumo de usuários por tipo."""
    db = current_app.db
    if db is None:
        return jsonify(message="banco de dados indisponível"), 503

    try:
        coll = get_collection(db)

        # Contagem por tipo
        pipeline = [
            {"$match": {"ativo": True}},
            {"$group": {
                "_id": "$tipo",
                "count": {"$sum": 1}
            }}
        ]

        result = list(coll.aggregate(pipeline))
        
        summary = {}
        for item in result:
            summary[item["_id"]] = item["count"]

        # Garante que todos os tipos apareçam
        for user_type in USER_TYPES:
            if user_type not in summary:
                summary[user_type] = 0

        total_users = sum(summary.values())

        return jsonify({
            "summary": summary,
            "total": total_users,
            "message": "Resumo de usuários obtido com sucesso"
        })

    except Exception as e:
        print(f"Erro ao obter resumo de usuários: {e}")
        return jsonify(message="Erro interno do servidor"), 500
