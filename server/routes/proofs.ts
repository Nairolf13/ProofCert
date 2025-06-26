import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.ts';

const router = Router();
const prisma = new PrismaClient();

// @ts-expect-error Express 5 type inference bug with custom req.user
router.post('/', authenticateToken, (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userId = req.user.id;
  const { title, content, contentType, location, isPublic } = req.body;
  prisma.proof.create({
    data: {
      title, content, contentType, location, isPublic: isPublic || false, userId,
      hash: `hash_${Math.random().toString(36).substring(2, 15)}`,
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`,
      shareToken: `share_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date(),
    }
  })
    .then(proof => { res.status(201).json(proof); })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
});

// @ts-expect-error Express 5 type inference bug with custom req.user
router.get('/', authenticateToken, (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userId = req.user.id;
  prisma.proof.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
    .then(proofs => { res.json(proofs); })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
});

// @ts-expect-error Express 5 type inference bug with custom req.user
router.get('/:id', authenticateToken, (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { id } = req.params;
  const userId = req.user.id;
  prisma.proof.findFirst({ where: { id, userId } })
    .then(proof => {
      if (!proof) { res.status(404).json({ error: 'Proof not found' }); return; }
      res.json(proof);
    })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
});

router.get('/share/:shareToken', (req, res) => {
  const { shareToken } = req.params;
  prisma.proof.findFirst({
    where: { shareToken, isPublic: true },
    select: { id: true, title: true, hash: true, timestamp: true, contentType: true, isPublic: true, ipfsHash: true }
  })
    .then(proof => {
      if (!proof) { res.status(404).json({ error: 'Shared proof not found' }); return; }
      res.json(proof);
    })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
});

// @ts-expect-error Express 5 type inference bug with custom req.user
router.delete('/:id', authenticateToken, (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { id } = req.params;
  const userId = req.user.id;
  prisma.proof.findFirst({ where: { id, userId } })
    .then(proof => {
      if (!proof) { res.status(404).json({ error: 'Proof not found' }); return; }
      return prisma.proof.delete({ where: { id } });
    })
    .then(() => { res.status(204).send(); })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
});

export default router;
