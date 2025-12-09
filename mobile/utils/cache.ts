import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

interface CacheConfig {
  expirationMinutes: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private defaultConfig: CacheConfig = {
    expirationMinutes: 5
  };

  async set<T>(key: string, data: T, config?: Partial<CacheConfig>): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };

    try {
      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      logger.error('Erro ao salvar no cache', error as Error, 'CACHE');
    }
  }

  async get<T>(key: string, config?: Partial<CacheConfig>): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const { expirationMinutes } = { ...this.defaultConfig, ...config };
      
      const expirationMs = expirationMinutes * 60 * 1000;
      const now = Date.now();

      if (now - cacheItem.timestamp > expirationMs) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logger.error('Erro ao ler do cache', error as Error, 'CACHE');
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      logger.error('Erro ao remover do cache', error as Error, 'CACHE');
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      logger.error('Erro ao limpar cache', error as Error, 'CACHE');
    }
  }

  /**
   * Invalida cache de produtos (após criar/editar/deletar)
   */
  async invalidateProducts(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const productCacheKeys = keys.filter(key => 
        key.startsWith('cache_/products') || 
        key.startsWith('cache_featured_products')
      );
      if (productCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(productCacheKeys);
        logger.cache('Cache de produtos invalidado', { keys: productCacheKeys.length });
      }
    } catch (error) {
      logger.error('Erro ao invalidar cache de produtos', error as Error, 'CACHE');
    }
  }

  /**
   * Invalida cache de categorias (após criar/editar/deletar)
   */
  async invalidateCategories(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const categoryCacheKeys = keys.filter(key => 
        key.startsWith('cache_/categories')
      );
      if (categoryCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(categoryCacheKeys);
        logger.cache('Cache de categorias invalidado', { keys: categoryCacheKeys.length });
      }
    } catch (error) {
      logger.error('Erro ao invalidar cache de categorias', error as Error, 'CACHE');
    }
  }

  /**
   * Invalida todo o cache (útil após logout ou erros críticos)
   */
  async invalidateAll(): Promise<void> {
    await this.clear();
    logger.cache('Todo o cache foi invalidado');
  }
}

export const cacheManager = new CacheManager();
