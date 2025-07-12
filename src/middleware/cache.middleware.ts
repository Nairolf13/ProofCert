import type { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache/cache.service';
import { redisConfig } from '../config/redis.config';

export const cacheMiddleware = (duration: number = redisConfig.ttl) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;

    try {
      const cachedData = await cacheService.get(key);
      if (cachedData) {
        console.log('Serving from cache:', key);
        return res.json(cachedData);
      }

      const originalSend = res.json;
      res.json = function (body) {
        cacheService.set(key, body, duration).catch(console.error);
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
