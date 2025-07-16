import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = Router();
const prisma = new PrismaClient();


router.post('/', authenticateToken, async (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userId = req.user.id;
  const {
    title, content, contentType, location, isPublic, propertyId,
    hash, ipfsHash, transactionHash, hashMvx
  } = req.body;

  // Vérifie la présence du hash de transaction blockchain (hashMvx ou transactionHash)
  const txHash = hashMvx || transactionHash;
  if (!txHash || typeof txHash !== 'string' || txHash.length < 5) {
    return res.status(400).json({ error: 'hashMvx (blockchain) requis pour créer une preuve.' });
  }
  // Vérifie la présence du hash de preuve (sha256)
  if (!hash || typeof hash !== 'string' || hash.length < 10) {
    return res.status(400).json({ error: 'hash (sha256) requis pour créer une preuve.' });
  }

  try {
    const proof = await prisma.proof.create({
      data: {
        title,
        content,
        contentType,
        location,
        isPublic: isPublic || false,
        userId,
        propertyId: propertyId || null,
        hash,
        ipfsHash: ipfsHash || null,
        hashMvx: txHash,
        shareToken: `share_${Math.random().toString(36).substring(2, 15)}`,
        timestamp: new Date(),
      }
    });
    res.status(201).json(proof);
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      // Conflit d'unicité (hash déjà existant)
      return res.status(409).json({ error: 'Une preuve avec ce hash existe déjà.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Soft delete: met à jour deletedAt au lieu de supprimer
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    // Admin peut supprimer n'importe quelle preuve, sinon seulement la sienne
    const where = userRole === 'ADMIN' ? { id } : { id, userId };
    const proof = await prisma.proof.findFirst({ where });
    if (!proof) { res.status(404).json({ error: 'Proof not found' }); return; }
    if (proof.deletedAt) { res.status(410).json({ error: 'Proof already deleted' }); return; }
    await prisma.proof.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET / (liste des preuves)
router.get('/', authenticateToken, async (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    let proofs;
    if (userRole === 'ADMIN') {
      // Admin : toutes les preuves, y compris archivées
      proofs = await prisma.proof.findMany({ orderBy: { createdAt: 'desc' } });
    } else {
      // Utilisateur : seulement ses preuves non supprimées
      proofs = await prisma.proof.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' }
      });
    }
    res.json(proofs);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

router.patch('/:id', authenticateToken, async (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { id } = req.params;
  const userId = req.user.id;
  const { transactionHash, ipfsHash } = req.body;
  if (!transactionHash && !ipfsHash) {
    res.status(400).json({ error: 'transactionHash or ipfsHash required' });
    return;
  }
  try {
    const proof = await prisma.proof.findFirst({ where: { id, userId } });
    if (!proof) { res.status(404).json({ error: 'Proof not found' }); return; }
    const updateData: Partial<{ transactionHash: string; ipfsHash: string }> = {};
    if (transactionHash) updateData.transactionHash = transactionHash;
    if (ipfsHash) updateData.ipfsHash = ipfsHash;
    const updated = await prisma.proof.update({ where: { id }, data: updateData });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-property/:propertyId', authenticateToken, async (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { propertyId } = req.params;
  try {
    const proofs = await prisma.proof.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(proofs);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
