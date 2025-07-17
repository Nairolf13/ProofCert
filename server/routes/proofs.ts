import { Router, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import type { Request } from 'express';

// Typage global pour req.user
import type { Role } from '@prisma/client';
interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  hashedPassword: string;
  walletAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  profileImage: string | null;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

const prisma = new PrismaClient();
const router = Router();
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = user.id;
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
    const proofData = {
      title: title || null,
      content: content || null,
      contentType: contentType || null,
      location: location || null,
      isPublic: Boolean(isPublic),
      userId,
      propertyId: propertyId || null,
      hash,
      ipfsHash: ipfsHash || null,
      hashMvx: txHash,
      shareToken: `share_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
    };
    const proof = await prisma.proof.create({ data: proofData });
    return res.status(201).json(proof);
  } catch (error) {
    console.error('Error creating proof:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002') {
      return res.status(409).json({ 
        error: 'Une preuve avec ce hash existe déjà.',
        code: 'DUPLICATE_HASH',
      });
    }
    if (error instanceof Error && error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        error: 'Données de preuve invalides',
        details: error.message,
      });
    }
    return res.status(500).json({
      error: 'Une erreur est survenue lors de la création de la preuve',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
});

// Soft delete: met à jour deletedAt au lieu de supprimer
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const userId = user.id;
  const userRole = user.role;
  try {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de preuve invalide', code: 'INVALID_PROOF_ID' });
    }
    const where = userRole === 'ADMIN' 
      ? { id, deletedAt: null } 
      : { id, userId, deletedAt: null };
    const proof = await prisma.proof.findFirst({ where });
    if (!proof) {
      return res.status(404).json({ error: 'Preuve non trouvée ou déjà supprimée', code: 'PROOF_NOT_FOUND' });
    }
    await prisma.proof.update({ 
      where: { id },
      data: { deletedAt: new Date(), shareToken: `deleted_${proof.shareToken}` },
    });
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting proof:', error);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de la preuve', code: 'INTERNAL_SERVER_ERROR' });
  }
});

// GET /share/:shareToken (public share route, placée avant /:id pour éviter conflit)
router.get('/share/:shareToken', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    if (!shareToken || typeof shareToken !== 'string') {
      return res.status(400).json({ error: 'Invalid share token', code: 'INVALID_SHARE_TOKEN' });
    }
    const proof = await prisma.proof.findFirst({
      where: { shareToken, isPublic: true, deletedAt: null },
      select: { id: true, title: true, hash: true, createdAt: true, contentType: true, isPublic: true, ipfsHash: true, content: true },
    });
    if (!proof) {
      return res.status(404).json({ error: 'Shared proof not found or not public', code: 'PROOF_NOT_FOUND_OR_NOT_PUBLIC' });
    }
    return res.json(proof);
  } catch {
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
});

// Get all proofs for the authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    type WhereCondition = { deletedAt?: Date | { equals: null } | { not: null } | null; userId?: string; OR?: Array<{ userId: string }>; };
    const includeDeleted = req.query.includeDeleted === 'true' && user.role === 'ADMIN';
    const where: WhereCondition = { ...(includeDeleted ? {} : { deletedAt: null }) };
    if (user.role !== 'ADMIN') {
      const conditions: Array<{ userId: string }> = [];
      if (user.id) {
        conditions.push({ userId: user.id });
      }
      const walletAddress = req.headers['x-wallet-address'] as string || user.walletAddress;
      if (walletAddress) {
        conditions.push({ userId: walletAddress });
      }
      if (conditions.length > 0) {
        where.OR = conditions;
      } else {
        where.userId = 'NO_MATCH';
      }
    }
    const proofs = await prisma.proof.findMany({ where, orderBy: { createdAt: 'desc' } });
    console.log('Returning proofs for user:', { userId: user.id, walletAddress: user.walletAddress, role: user.role, proofCount: proofs.length });
    return res.json(proofs);
  } catch (error) {
    console.error('Error fetching proofs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  try {
    const proof = await prisma.proof.findFirst({ where: { id, userId: user.id } });
    if (!proof) { res.status(404).json({ error: 'Proof not found' }); return; }
    res.json(proof);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const { transactionHash, ipfsHash } = req.body;
  if (!transactionHash && !ipfsHash) {
    return res.status(400).json({ error: 'transactionHash or ipfsHash required' });
  }
  try {
    const proof = await prisma.proof.findFirst({ where: { id, userId: user.id } });
    if (!proof) { return res.status(404).json({ error: 'Proof not found' }); }
    const updateData: Partial<{ transactionHash: string; ipfsHash: string }> = {};
    if (transactionHash) updateData.transactionHash = transactionHash;
    if (ipfsHash) updateData.ipfsHash = ipfsHash;
    const updated = await prisma.proof.update({ where: { id }, data: updateData });
    res.json(updated);
  } catch (error) {
    console.error('Error updating proof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-property/:propertyId', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { propertyId } = req.params;
  try {
    const proofs = await prisma.proof.findMany({ where: { propertyId, userId: user.id }, orderBy: { createdAt: 'desc' } });
    res.json(proofs);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
