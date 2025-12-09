"""
Testes para rotas de health check.
"""
import pytest


class TestHealthRoutes:
    """Testes para endpoints de health."""
    
    def test_root_endpoint(self, client):
        """Testa endpoint raiz."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data["status"] == "online"
        assert "message" in data
        assert "version" in data
        assert "endpoints" in data
    
    def test_health_endpoint(self, client):
        """Testa endpoint de health check."""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        data = response.get_json()
        
        # API retorna {success: True, data: {status: 'OK', ...}}
        assert "success" in data
        assert data["success"] == True
        assert "data" in data
        assert data["data"]["status"] == "OK"
    
    def test_health_has_memory_info(self, client):
        """Testa que health retorna informações de memória."""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Verifica campos detalhados
        assert "data" in data
        assert "memory_usage" in data["data"]


class TestCORS:
    """Testes para configuração CORS."""
    
    def test_cors_headers_on_options(self, client):
        """Testa headers CORS em requisição OPTIONS."""
        response = client.options("/api/health")
        
        # OPTIONS deve retornar 200 ou 204
        assert response.status_code in [200, 204]
    
    def test_cors_allows_json_content_type(self, client):
        """Testa que Content-Type JSON é aceito."""
        response = client.get(
            "/api/health",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200


class TestErrorHandlers:
    """Testes para handlers de erro."""
    
    def test_404_not_found(self, client):
        """Testa resposta para rota inexistente."""
        response = client.get("/api/rota-inexistente")
        
        assert response.status_code == 404
        data = response.get_json()
        
        assert data["success"] == False
        assert "message" in data
    
    def test_405_method_not_allowed(self, client):
        """Testa resposta para método não permitido."""
        # Tenta DELETE em endpoint que não suporta
        response = client.delete("/")
        
        assert response.status_code == 405
        data = response.get_json()
        
        assert data["success"] == False
