"""
Utilitários de cache para a aplicação.
Implementa cache em memória com TTL para dados frequentemente acessados.
"""
from cachetools import TTLCache
from threading import Lock
from typing import Any, Optional, Set
import time

# Cache de categorias ativas (TTL de 5 minutos)
_categories_cache: TTLCache = TTLCache(maxsize=1, ttl=300)
_categories_lock = Lock()

# Cache de configurações (TTL de 10 minutos)
_config_cache: TTLCache = TTLCache(maxsize=100, ttl=600)
_config_lock = Lock()


def get_cached_categories(db) -> Set[str]:
    """
    Retorna categorias ativas do cache ou do banco.
    Cache tem TTL de 5 minutos para evitar queries repetidas.
    
    Args:
        db: Instância do banco de dados MongoDB
        
    Returns:
        Set com nomes das categorias ativas
    """
    cache_key = "active_categories"
    
    with _categories_lock:
        if cache_key in _categories_cache:
            return _categories_cache[cache_key]
        
        # Cache miss - busca do banco
        if db is None:
            return set()
        
        try:
            from ..models.category_model import get_active_categories_list
            categories = set(get_active_categories_list(db))
            _categories_cache[cache_key] = categories
            return categories
        except Exception as e:
            print(f"Erro ao buscar categorias para cache: {e}")
            return set()


def invalidate_categories_cache():
    """Invalida o cache de categorias (chamar após criar/editar/deletar categoria)."""
    with _categories_lock:
        _categories_cache.clear()


def get_cached_value(key: str, default: Any = None) -> Any:
    """Obtém valor do cache de configurações."""
    with _config_lock:
        return _config_cache.get(key, default)


def set_cached_value(key: str, value: Any, ttl: Optional[int] = None):
    """
    Define valor no cache de configurações.
    
    Args:
        key: Chave do cache
        value: Valor a ser armazenado
        ttl: TTL customizado (não suportado pelo TTLCache padrão, ignorado)
    """
    with _config_lock:
        _config_cache[key] = value


def clear_all_caches():
    """Limpa todos os caches (útil para testes)."""
    with _categories_lock:
        _categories_cache.clear()
    with _config_lock:
        _config_cache.clear()


class CacheStats:
    """Estatísticas de uso do cache."""
    
    @staticmethod
    def get_stats() -> dict:
        """Retorna estatísticas dos caches."""
        return {
            "categories_cache": {
                "size": len(_categories_cache),
                "maxsize": _categories_cache.maxsize,
                "ttl": _categories_cache.ttl,
            },
            "config_cache": {
                "size": len(_config_cache),
                "maxsize": _config_cache.maxsize,
                "ttl": _config_cache.ttl,
            }
        }
