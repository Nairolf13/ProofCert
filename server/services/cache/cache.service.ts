import { redisClient } from '../../lib/redis/redis-client';

const CACHE_PREFIX = 'proofcert:';

class CacheService {
  private getKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      await redisClient.connect();
      const data = await redisClient.getClient().get(this.getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      await redisClient.connect();
      const stringValue = JSON.stringify(value);
      
      if (ttl) {
        await redisClient.getClient().setEx(this.getKey(key), ttl, stringValue);
      } else {
        await redisClient.getClient().set(this.getKey(key), stringValue);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await redisClient.connect();
      await redisClient.getClient().del(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async clearByPattern(pattern: string): Promise<boolean> {
    try {
      await redisClient.connect();
      const keys = await redisClient.getClient().keys(this.getKey(`${pattern}*`));
      
      if (keys.length > 0) {
        await redisClient.getClient().del(keys);
      }
      
      return true;
    } catch (error) {
      console.error('Cache clear by pattern error:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();
