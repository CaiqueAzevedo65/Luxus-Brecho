import sys
import os

# garante que a raiz do projeto (Luxus-Brecho) está no sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app import create_app
import pytest


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client
import pytest

class MockCursor:
    def __init__(self, data):
        self.data = data
        self._skip = 0
        self._limit = None
        self._sort = None

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    def sort(self, key, direction=1):
        self._sort = (key, direction)
        return self

    def __iter__(self):
        data = list(self.data)
        if self._sort:
            key, direction = self._sort
            data.sort(key=lambda x: x.get(key), reverse=(direction == -1))
        if self._skip:
            data = data[self._skip:]
        if self._limit is not None:
            data = data[:self._limit]
        return iter(data)


class MockCollection:
    def __init__(self, data):
        self.data = list(data)

    def find(self, query=None, projection=None):
        query = query or {}
        result = []
        for item in self.data:
            if all(item.get(k) == v for k, v in query.items()):
                result.append(dict(item))
        return MockCursor(result)

    def find_one(self, query):
        for item in self.data:
            if all(item.get(k) == v for k, v in query.items()):
                return dict(item)
        return None

    def insert_one(self, doc):
        if any(x["id"] == doc["id"] for x in self.data):
            from pymongo.errors import DuplicateKeyError
            raise DuplicateKeyError("duplicate id")
        self.data.append(dict(doc))
        return {"inserted_id": doc["id"]}

    def update_one(self, query, update):
        for idx, item in enumerate(self.data):
            if all(item.get(k) == v for k, v in query.items()):
                self.data[idx].update(update["$set"])
                return {"modified_count": 1}
        return {"modified_count": 0}

    def delete_one(self, query):
        for idx, item in enumerate(self.data):
            if all(item.get(k) == v for k, v in query.items()):
                del self.data[idx]
                return type("Result", (), {"deleted_count": 1})
        return type("Result", (), {"deleted_count": 0})

    def count_documents(self, query):
        return len(list(self.find(query)))


class MockDB:
    def __init__(self):
        self.collections = {
            "products": MockCollection([
                {"id": 1, "titulo": "Produto 1", "preco": 10.0, "descricao": "Desc 1", "categoria": "Casual", "imagem": "img1.jpg"},
                {"id": 2, "titulo": "Produto 2", "preco": 20.0, "descricao": "Desc 2", "categoria": "Casual", "imagem": "img2.jpg"},
            ]),
            "categories": MockCollection([
                {"id": 1, "name": "Casual", "description": "Roupas casuais", "active": True},
                {"id": 2, "name": "Esportivo", "description": "Roupas esportivas", "active": True},
                {"id": 3, "name": "Luxo", "description": "Roupas de luxo", "active": False},
            ]),
        }

    def __getitem__(self, name):
        return self.collections[name]

    def get_collection(self, name):
        return self.collections[name]


@pytest.fixture
def mock_db():
    return MockDB()
