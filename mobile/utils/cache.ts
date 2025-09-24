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
}

export const cacheManager = new CacheManager();
