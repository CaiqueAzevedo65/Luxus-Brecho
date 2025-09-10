import pytest
from flask import Flask
from app.routes.health_routes import health_bp

@pytest.fixture
def client(monkeypatch, mock_db):
    app = Flask(__name__)
    app.register_blueprint(health_bp)

    monkeypatch.setattr(
        "app.controllers.health_controller.current_app",
        type("obj", (), {"db": mock_db}),
    )

    return app.test_client()

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert "status" in data
    assert "db" in data
    assert data["status"] == "ok"
    assert data["db"] == "ok"
