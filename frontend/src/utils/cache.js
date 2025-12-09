/**
 * Gerenciador de cache para o frontend.
 * Usa localStorage com TTL (Time-To-Live) para armazenar dados.
 */

import { logger } from './logger';

const CACHE_PREFIX = 'luxus_cache_';
const DEFAULT_TTL_MINUTES = 5;

/**
 * Classe para gerenciar cache no localStorage
 */
class CacheManager {
  /**
   * Salva dados no cache com expiração
   * @param {string} key - Chave do cache
   * @param {any} data - Dados a serem armazenados
   * @param {number} ttlMinutes - Tempo de vida em minutos
   */
  set(key, data, ttlMinutes = DEFAULT_TTL_MINUTES) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
      
      const cacheData = {
        data,
        expiresAt,
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      logger.cache('SET', key);
    } catch (error) {
      logger.error('Erro ao salvar no cache', error, 'CACHE');
    }
  }

  /**
   * Recupera dados do cache
   * @param {string} key - Chave do cache
   * @returns {any|null} - Dados ou null se expirado/inexistente
   */
  get(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        logger.cache('GET', key, false);
        return null;
      }
      
      const { data, expiresAt } = JSON.parse(cached);
      
      if (Date.now() > expiresAt) {
        this.remove(key);
        logger.cache('EXPIRED', key);
        return null;
      }
      
      logger.cache('GET', key, true);
      return data;
    } catch (error) {
      logger.error('Erro ao recuperar do cache', error, 'CACHE');
      return null;
    }
  }

  /**
   * Remove item do cache
   * @param {string} key - Chave do cache
   */
  remove(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
      logger.cache('REMOVE', key);
    } catch (error) {
      logger.error('Erro ao remover do cache', error, 'CACHE');
    }
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      logger.cache('CLEAR', 'all');
    } catch (error) {
      logger.error('Erro ao limpar cache', error, 'CACHE');
    }
  }

  /**
   * Invalida cache de produtos
   */
  invalidateProducts() {
    try {
      const keys = Object.keys(localStorage);
      const productKeys = keys.filter(key => 
        key.startsWith(CACHE_PREFIX + 'products') ||
        key.startsWith(CACHE_PREFIX + 'featured')
      );
      
      productKeys.forEach(key => localStorage.removeItem(key));
      
      if (productKeys.length > 0) {
        logger.cache('INVALIDATE', `products (${productKeys.length} keys)`);
      }
    } catch (error) {
      logger.error('Erro ao invalidar cache de produtos', error, 'CACHE');
    }
  }

  /**
   * Invalida cache de categorias
   */
  invalidateCategories() {
    try {
      const keys = Object.keys(localStorage);
      const categoryKeys = keys.filter(key => 
        key.startsWith(CACHE_PREFIX + 'categories')
      );
      
      categoryKeys.forEach(key => localStorage.removeItem(key));
      
      if (categoryKeys.length > 0) {
        logger.cache('INVALIDATE', `categories (${categoryKeys.length} keys)`);
      }
    } catch (error) {
      logger.error('Erro ao invalidar cache de categorias', error, 'CACHE');
    }
  }

  /**
   * Invalida todo o cache (útil após logout)
   */
  invalidateAll() {
    this.clear();
    logger.cache('INVALIDATE', 'all');
  }
}

export const cacheManager = new CacheManager();
export default cacheManager;
