"""
Modelo e utilidades para a coleção de produtos.
- Define categorias permitidas
- Valida payloads de produto
- Garante validator e índices no MongoDB
"""
from typing import Dict, Any, Tuple
from pymongo import ASCENDING, TEXT
from pymongo.collection import ReturnDocument

COLLECTION_NAME = "products"
COUNTERS_COLLECTION = "counters"
COUNTER_KEY_PRODUCTS = "products"

ALLOWED_CATEGORIES = {
    "Casual",
    "Social",
    "Esportivo",
}

_normalize_category = {
    "casual": "Casual",
    "social": "Social",
    "esportivo": "Esportivo",
}

# Validador JSON Schema para MongoDB (usado em createCollection/collMod)
MONGO_JSON_SCHEMA: Dict[str, Any] = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id", "titulo", "preco", "descricao", "categoria", "imagem"],
        "properties": {
            "id": {
                "description": "Identificador numérico único do produto",
                "bsonType": ["int", "long"],
            },
            "titulo": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Título do produto"
            },
            "preco": {
                "bsonType": ["double", "int", "long"],
                "minimum": 0,
                "description": "Preço do produto"
            },
            "descricao": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Descrição do produto"
            },
            "categoria": {
                "bsonType": "string",
                "enum": list(ALLOWED_CATEGORIES),
                "description": "Categoria do produto"
            },
            "imagem": {
                "bsonType": "string",
                "minLength": 1,
                "description": "URL (ou caminho) da imagem no object storage"
            },
        },
        "additionalProperties": True,
    }
}


def normalize_product(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Normaliza campos (categoria, strings básicas). Não altera tipos numéricos.
    """
    data = dict(payload or {})

    # Normaliza categoria para capitalização padrão
    cat = str(data.get("categoria", "")).strip()
    if cat:
        data["categoria"] = _normalize_category.get(cat.lower(), cat)

    # Trim de strings principais
    for key in ("titulo", "descricao", "imagem"):
        if key in data and isinstance(data[key], str):
            data[key] = data[key].strip()

    return data


def validate_product(payload: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
    """Valida o payload do produto (validação em app). Retorna (ok, erros).
    Observação: a coleção também terá validator no MongoDB.
    """
    errors: Dict[str, str] = {}
    data = normalize_product(payload)

    # id é opcional neste momento (poderemos auto-gerar depois). Se enviado, deve ser int/long.
    if "id" in data and not isinstance(data["id"], (int,)):
        errors["id"] = "deve ser inteiro"

    # Campos obrigatórios
    required = ["titulo", "preco", "descricao", "categoria", "imagem"]
    for k in required:
        if data.get(k) in (None, ""):
            errors[k] = "obrigatório"

    # Tipos
    if "preco" in data and not isinstance(data.get("preco"), (int, float)):
        errors["preco"] = "deve ser numérico"

    # Categoria permitida
    cat = data.get("categoria")
    if cat and cat not in ALLOWED_CATEGORIES:
        errors["categoria"] = f"deve ser uma das: {', '.join(sorted(ALLOWED_CATEGORIES))}"

    return (len(errors) == 0), errors


def get_collection(db):
    return db[COLLECTION_NAME]


def ensure_products_collection(db):
    """Garante que a coleção exista com validator e índices úteis.
    - Cria coleção com validator se não existir
    - Aplica collMod para atualizar validator se já existir
    - Cria índices: uniq_id em id, idx_categoria, e índice de texto para título+descrição
    """
    if db is None:
        return None

    try:
        if COLLECTION_NAME not in db.list_collection_names():
            db.create_collection(
                COLLECTION_NAME,
                validator=MONGO_JSON_SCHEMA,
                validationLevel="moderate",
            )
        else:
            # Atualiza validator se a coleção já existir
            db.command(
                "collMod",
                COLLECTION_NAME,
                validator=MONGO_JSON_SCHEMA,
                validationLevel="moderate",
            )
    except Exception as e:
        print(f"Aviso: não foi possível aplicar validator na coleção '{COLLECTION_NAME}': {e}")

    # Garante a coleção de counters e documento inicial para produtos
    try:
        ensure_counters_collection(db)
    except Exception as e:
        print(f"Aviso: não foi possível preparar counters: {e}")

    coll = db[COLLECTION_NAME]

    # Índices
    try:
        coll.create_index([("id", ASCENDING)], unique=True, name="uniq_id")
    except Exception as e:
        print(f"Aviso: não foi possível criar índice único em 'id': {e}")

    try:
        coll.create_index([("categoria", ASCENDING)], name="idx_categoria")
    except Exception as e:
        print(f"Aviso: não foi possível criar índice em 'categoria': {e}")

    try:
        coll.create_index([("titulo", TEXT), ("descricao", TEXT)], name="txt_titulo_descricao")
    except Exception as e:
        print(f"Aviso: não foi possível criar índice de texto: {e}")

    return coll


def ensure_counters_collection(db):
    """Garante a coleção de contadores e documento base para produtos."""
    if db is None:
        return None
    coll = db[COUNTERS_COLLECTION]
    try:
        coll.create_index([("name", ASCENDING)], unique=True, name="uniq_name")
    except Exception as e:
        print(f"Aviso: não foi possível criar índice em counters.name: {e}")
    # Garante documento para products
    try:
        coll.update_one(
            {"name": COUNTER_KEY_PRODUCTS},
            {"$setOnInsert": {"seq": 0}},
            upsert=True,
        )
    except Exception as e:
        print(f"Aviso: não foi possível inicializar contador de produtos: {e}")
    return coll


def get_next_sequence(db, name: str) -> int:
    """Obtém o próximo número sequencial para um contador nomeado."""
    doc = db[COUNTERS_COLLECTION].find_one_and_update(
        {"name": name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(doc["seq"]) if doc and "seq" in doc else 1


def prepare_new_product(db, payload: Dict[str, Any]) -> Tuple[bool, Dict[str, str], Dict[str, Any]]:
    """Normaliza, valida e atribui id sequencial se necessário.
    Retorna (ok, erros, documento_pronto).
    """
    data = normalize_product(payload)
    ok, errors = validate_product(data)
    if not ok:
        return False, errors, {}

    # Gera id se não informado
    if "id" not in data:
        try:
            ensure_counters_collection(db)
            data["id"] = get_next_sequence(db, COUNTER_KEY_PRODUCTS)
        except Exception as e:
            errors["id"] = f"falha ao gerar id: {e}"
            return False, errors, {}

    # Coerção de tipos: preço como float
    if isinstance(data.get("preco"), int):
        data["preco"] = float(data["preco"])

    return True, {}, data
