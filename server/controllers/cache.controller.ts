import { Request, Response } from 'express';
import { cacheService } from '../services/cache/cache.service';

interface CacheResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const sendResponse = <T>(res: Response, status: number, data: CacheResponse<T>) => {
  return res.status(status).json(data);
};

export const cacheController = {
  get: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key } = req.params;
      if (!key) {
        return sendResponse(res, 400, { 
          success: false, 
          error: 'Key is required' 
        });
      }

      const data = await cacheService.get(key);
      return sendResponse(res, 200, { 
        success: true, 
        data 
      });
    } catch (error) {
      console.error('Cache get error:', error);
      return sendResponse(res, 500, { 
        success: false, 
        error: 'Internal server error' 
      });
    }
  },

  set: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key } = req.params;
      const { value, ttl } = req.body;

      if (!key || value === undefined) {
        return sendResponse(res, 400, { 
          success: false, 
          error: 'Key and value are required' 
        });
      }

      await cacheService.set(key, value, ttl);
      return sendResponse(res, 200, { 
        success: true 
      });
    } catch (error) {
      console.error('Cache set error:', error);
      return sendResponse(res, 500, { 
        success: false, 
        error: 'Internal server error' 
      });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key } = req.params;
      if (!key) {
        return sendResponse(res, 400, { 
          success: false, 
          error: 'Key is required' 
        });
      }

      await cacheService.delete(key);
      return sendResponse(res, 200, { 
        success: true 
      });
    } catch (error) {
      console.error('Cache delete error:', error);
      return sendResponse(res, 500, { 
        success: false, 
        error: 'Internal server error' 
      });
    }
  },

  clearByPattern: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { pattern } = req.params;
      if (!pattern) {
        return sendResponse(res, 400, { 
          success: false, 
          error: 'Pattern is required' 
        });
      }

      await cacheService.clearByPattern(pattern);
      return sendResponse(res, 200, { 
        success: true 
      });
    } catch (error) {
      console.error('Cache clear by pattern error:', error);
      return sendResponse(res, 500, { 
        success: false, 
        error: 'Internal server error' 
      });
    }
  },
} as const;
