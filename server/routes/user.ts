import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @ts-expect-error Express types are not compatible with ESM import style
router.get('/by-wallet/:walletAddress', async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });
  const user = await prisma.user.findFirst({ where: { walletAddress } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;