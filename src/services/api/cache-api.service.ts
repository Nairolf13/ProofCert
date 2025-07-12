import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface CacheResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class CacheApiService {
  private static instance: CacheApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/api/cache`;
  }

  public static getInstance(): CacheApiService {
    if (!CacheApiService.instance) {
      CacheApiService.instance = new CacheApiService();
    }
    return CacheApiService.instance;
  }

  /**
   * Récupère une valeur du cache
   * @param key La clé du cache
   * @returns La valeur mise en cache ou null si non trouvée
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const response = await axios.get<CacheResponse<T>>(`${this.baseUrl}/${encodeURIComponent(key)}`);
      return response.data.success ? response.data.data ?? null : null;
    } catch (error) {
      console.error('Cache API get error:', error);
      return null;
    }
  }

  /**
   * Définit une valeur dans le cache
   * @param key La clé du cache
   * @param value La valeur à mettre en cache
   * @param ttl Durée de vie en secondes (optionnel)
   * @returns true si l'opération a réussi, false sinon
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const response = await axios.post<CacheResponse>(
        `${this.baseUrl}/${encodeURIComponent(key)}`,
        { value, ttl }
      );
      return response.data.success;
    } catch (error) {
      console.error('Cache API set error:', error);
      return false;
    }
  }

  /**
   * Supprime une entrée du cache
   * @param key La clé du cache à supprimer
   * @returns true si l'opération a réussi, false sinon
   */
  public async delete(key: string): Promise<boolean> {
    try {
      const response = await axios.delete<CacheResponse>(`${this.baseUrl}/${encodeURIComponent(key)}`);
      return response.data.success;
    } catch (error) {
      console.error('Cache API delete error:', error);
      return false;
    }
  }

  /**
   * Supprime toutes les entrées correspondant à un motif
   * @param pattern Le motif à utiliser pour la suppression
   * @returns true si l'opération a réussi, false sinon
   */
  public async clearByPattern(pattern: string): Promise<boolean> {
    try {
      const response = await axios.post<CacheResponse>(
        `${this.baseUrl}/clear/${encodeURIComponent(pattern)}`
      );
      return response.data.success;
    } catch (error) {
      console.error('Cache API clear by pattern error:', error);
      return false;
    }
  }
}

export const cacheApiService = CacheApiService.getInstance();
