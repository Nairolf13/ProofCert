import { useCallback } from 'react';
import { cacheApiService } from '../services/api/cache-api.service';

interface UseCacheReturn {
  getCache: <T>(key: string) => Promise<T | null>;
  setCache: <T>(key: string, value: T, ttl?: number) => Promise<boolean>;
  deleteCache: (key: string) => Promise<boolean>;
  clearCacheByPattern: (pattern: string) => Promise<boolean>;
}

/**
 * Hook personnalisé pour gérer le cache côté client
 * @returns Un objet avec des méthodes pour interagir avec le cache
 */
export const useCache = (): UseCacheReturn => {
  const getCache = useCallback(async <T,>(key: string): Promise<T | null> => {
    return cacheApiService.get<T>(key);
  }, []);

  const setCache = useCallback(async <T,>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<boolean> => {
    return cacheApiService.set<T>(key, value, ttl);
  }, []);

  const deleteCache = useCallback(async (key: string): Promise<boolean> => {
    return cacheApiService.delete(key);
  }, []);

  const clearCacheByPattern = useCallback(async (pattern: string): Promise<boolean> => {
    return cacheApiService.clearByPattern(pattern);
  }, []);

  return {
    getCache,
    setCache,
    deleteCache,
    clearCacheByPattern,
  };
};
