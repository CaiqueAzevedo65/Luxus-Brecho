from typing import Any, Dict, Tuple, List
from pymongo import ASCENDING, ReturnDocument

COLLECTION_NAME = "categories"
COUNTERS_COLLECTION = "counters"
COUNTER_KEY_CATEGORIES = "categories"

MONGO_JSON_SCHEMA: Dict[str, Any] = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id", "titulo", "descricao", "ativo"],
        "properties": {
            "id": {
                "description": "Identificador numérico único da categoria",
                "bsonType": ["int", "long"],
            },
            "titulo": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Título da categoria"
            },
            "descricao": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Descrição da categoria"
            },
            "ativo": {
                "bsonType": "bool",
                "description": "Se a categoria está ativa"
            }
        },
        "additionalProperties": True,
    }
}

# -------------------
# Normalização & Validação
# -------------------

def normalize_category(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Normaliza campos da categoria (aliases, strings, boolean)."""
    data = dict(payload or {})

    # Aliases → titulo
    if "titulo" not in data:
        if "name" in data:
            data["titulo"] = data.pop("name")
        elif "nome" in data:
            data["titulo"] = data.pop("nome")
        elif "categoria" in data:
            data["titulo"] = data.pop("categoria")

    # Aliases → descricao
    if "descricao" not in data and "description" in data:
        data["descricao"] = data.pop("description")

    # Aliases → ativo
    if "ativo" not in data and "active" in data:
        data["ativo"] = bool(data.pop("active"))

    # Trim strings
    for key in ("titulo", "descricao"):
        if key in data and isinstance(data[key], str):
            data[key] = data[key].strip()

    if "ativo" in data:
        data["ativo"] = bool(data["ativo"])

    return data


def validate_category(payload: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
    """Valida o payload da categoria. Retorna (ok, erros)."""
    errors: Dict[str, str] = {}
    data = normalize_category(payload)

    if "id" in data and not isinstance(data["id"], int):
        errors["id"] = "deve ser inteiro"

    for k in ("titulo", "descricao"):
        if data.get(k) in (None, ""):
            errors[k] = "obrigatório"

    if "titulo" in data:
        titulo = data["titulo"]
        if len(titulo) < 2:
            errors["titulo"] = "deve ter pelo menos 2 caracteres"
        elif len(titulo) > 50:
            errors["titulo"] = "deve ter no máximo 50 caracteres"

    if "descricao" in data:
        desc = data["descricao"]
        if len(desc) < 5:
            errors["descricao"] = "deve ter pelo menos 5 caracteres"
        elif len(desc) > 200:
            errors["descricao"] = "deve ter no máximo 200 caracteres"

    return (len(errors) == 0), errors

# -------------------
# Coleção & Contadores
# -------------------

def get_collection(db):
    return db[COLLECTION_NAME]


def ensure_counters_collection(db):
    if db is None:
        return None
    coll = db[COUNTERS_COLLECTION]
    coll.create_index([("name", ASCENDING)], unique=True, name="uniq_name")
    coll.update_one({"name": COUNTER_KEY_CATEGORIES}, {"$setOnInsert": {"seq": 0}}, upsert=True)
    return coll


def get_next_sequence(db, name: str) -> int:
    doc = db[COUNTERS_COLLECTION].find_one_and_update(
        {"name": name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(doc["seq"]) if doc and "seq" in doc else 1


def ensure_categories_collection(db):
    if db is None:
        return None

    if COLLECTION_NAME not in db.list_collection_names():
        db.create_collection(
            COLLECTION_NAME,
            validator=MONGO_JSON_SCHEMA,
            validationLevel="moderate",
        )
    else:
        db.command("collMod", COLLECTION_NAME, validator=MONGO_JSON_SCHEMA, validationLevel="moderate")

    ensure_counters_collection(db)

    coll = db[COLLECTION_NAME]
    coll.create_index([("id", ASCENDING)], unique=True, name="uniq_id")
    coll.create_index([("titulo", ASCENDING)], unique=True, name="uniq_titulo")
    coll.create_index([("ativo", ASCENDING)], name="idx_ativo")
    return coll

# -------------------
# Helpers
# -------------------

def prepare_new_category(db, payload: Dict[str, Any]):
    data = normalize_category(payload)
    ok, errors = validate_category(data)
    if not ok:
        return False, errors, {}

    if "id" not in data:
        ensure_counters_collection(db)
        data["id"] = get_next_sequence(db, COUNTER_KEY_CATEGORIES)

    if "ativo" not in data:
        data["ativo"] = True

    return True, {}, data


def get_active_categories_list(db) -> List[str]:
    if db is None:
        return []
    coll = get_collection(db)
    return [cat["titulo"] for cat in coll.find({"ativo": True}, {"titulo": 1, "_id": 0})]

def seed_default_categories(db, default_titles: List[str] = None) -> int:
    """
    Popula a coleção de categorias com um conjunto padrão de títulos caso esteja vazia.
    Retorna o número de documentos inseridos (0 se já existirem categorias ou db for None).
    """
    if db is None:
        return 0

    coll = get_collection(db)
    # Se já houver documentos, não faz nada
    if coll.count_documents({}) > 0:
        return 0

    # Títulos padrão se não fornecidos
    titles = default_titles or ["Roupas", "Acessórios", "Calçados", "Bolsas", "Decoração"]

    # Garante existência da coleção de contadores antes de gerar ids
    ensure_counters_collection(db)

    docs = []
    for titulo in titles:
        doc = {
            "id": get_next_sequence(db, COUNTER_KEY_CATEGORIES),
            "titulo": titulo,
            "ativo": True
        }
        docs.append(doc)

    if docs:
        coll.insert_many(docs)

    return len(docs)