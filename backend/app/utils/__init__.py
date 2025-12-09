"""Utilitários da aplicação."""
from .cache import (
    get_cached_categories,
    invalidate_categories_cache,
    get_cached_value,
    set_cached_value,
    clear_all_caches,
    CacheStats,
)

__all__ = [
    "get_cached_categories",
    "invalidate_categories_cache",
    "get_cached_value",
    "set_cached_value",
    "clear_all_caches",
    "CacheStats",
]
