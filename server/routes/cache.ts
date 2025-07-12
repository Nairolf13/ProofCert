import { Router, Request, Response, NextFunction } from 'express';
import { cacheController } from '../controllers/cache.controller';

const router = Router();

// GET /api/cache/:key - Récupérer une valeur du cache
router.get('/:key', (req: Request, res: Response, next: NextFunction) => {
  cacheController.get(req, res).catch(next);
});

// POST /api/cache/:key - Définir une valeur dans le cache
router.post('/:key', (req: Request, res: Response, next: NextFunction) => {
  cacheController.set(req, res).catch(next);
});

// DELETE /api/cache/:key - Supprimer une valeur du cache
router.delete('/:key', (req: Request, res: Response, next: NextFunction) => {
  cacheController.delete(req, res).catch(next);
});

// POST /api/cache/clear/:pattern - Supprimer les clés correspondant à un motif
router.post('/clear/:pattern', (req: Request, res: Response, next: NextFunction) => {
  cacheController.clearByPattern(req, res).catch(next);
});

export default router;
