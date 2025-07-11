import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/authenticateToken';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userId = req.user.id;
  const { title, content, contentType, location, isPublic, propertyId } = req.body;
  prisma.proof.create({
    data: {
      title, content, contentType, location, isPublic: isPublic || false, userId,
      propertyId: propertyId || null,
      hash: `hash_${Math.random().toString(36).substring(2, 15)}`,
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`,
      shareToken: `share_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date(),
    }
  })
    .then(proof => { res.status(201).json(proof); })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
});

// Soft delete: met à jour deletedAt au lieu de supprimer
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
router.get('/', authenticateToken, (async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) { 
    return res.status(401).json({ error: 'Unauthorized' }); 
  }

  try {
    // Définir le type pour la condition de recherche
    type WhereCondition = {
      deletedAt: null;
      userId?: string;
      OR?: Array<{ userId: string }>;
    };
    
    const where: WhereCondition = { 
      deletedAt: null
    };
    
    // Si l'utilisateur n'est pas admin, on filtre par son ID ou son adresse de wallet
    if (req.user.role !== 'ADMIN') {
      // Créer un tableau de conditions non nulles
      const conditions: Array<{ userId: string }> = [];
      
      // Ajouter l'ID utilisateur classique s'il existe
      if (req.user.id) {
        conditions.push({ userId: req.user.id });
      }
      
      // Ajouter l'adresse du portefeuille si elle existe (depuis le header ou le user)
      const walletAddress = req.headers['x-wallet-address'] as string || req.user.walletAddress;
      if (walletAddress) {
        conditions.push({ userId: walletAddress });
      }
      
      // Si on a des conditions, on les ajoute à la requête
      if (conditions.length > 0) {
        where.OR = conditions;
      } else {
        // Si pas de conditions, on ne retourne rien
        where.userId = 'NO_MATCH';
      }
    }

    const proofs = await prisma.proof.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    console.log('Returning proofs for user:', {
      userId: req.user.id,
      walletAddress: req.user.walletAddress,
      role: req.user.role,
      proofCount: proofs.length
    });

    // Utiliser res.json() sans return pour éviter les problèmes de typage
    res.json(proofs);
  } catch (error) {
    console.error('Error fetching proofs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  return;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any);

router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
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

router.get('/share/:shareToken', (req: Request, res: Response) => {
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

router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.get('/by-property/:propertyId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
