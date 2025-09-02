import pytest
from flask import Flask
from app.routes.health_routes import health_bp

# ===========================
# Fixtures
# ===========================

@pytest.fixture
def app():
    app = Flask(__name__)
    # Simula a ausência de conexão com o MongoDB
    app.mongo = None
    app.register_blueprint(health_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()


# ===========================
# Testes
# ===========================

def test_health_mongo_down(client):
    """
    Testa a rota /api/health quando mongo está indisponível.
    Deve retornar 503 e database_status = DOWN.
    """
    response = client.get("/api/health")
    assert response.status_code == 503
    data = response.get_json()
    assert data["api_status"] == "UP"
    assert data["database_status"] == "DOWN"


@pytest.fixture
def app_mongo_up():
    """
    Simula app com MongoDB disponível.
    O atributo mongo deve responder ao comando 'ping'.
    """
    app = Flask(__name__)

    class MockMongo:
        class Admin:
            def command(self, cmd):
                if cmd == "ping":
                    return {"ok": 1}
        @property
        def admin(self):
            return MockMongo.Admin()

    app.mongo = MockMongo()
    app.register_blueprint(health_bp)
    return app

@pytest.fixture
def client_mongo_up(app_mongo_up):
    return app_mongo_up.test_client()


def test_health_mongo_up(client_mongo_up):
    """
    Testa a rota /api/health quando mongo está disponível.
    Deve retornar 200 e database_status = UP.
    """
    response = client_mongo_up.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["api_status"] == "UP"
    assert data["database_status"] == "UP"
