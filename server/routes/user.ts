import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @ts-expect-error Express types are not compatible with ESM import style
router.get('/by-wallet/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false,
        error: 'Wallet address is required',
        details: 'No wallet address provided in the URL parameters'
      });
    }

    const user = await prisma.user.findFirst({ 
      where: { 
        walletAddress: walletAddress.toLowerCase() // Ensure case-insensitive search
      } 
    });

    if (!user) {
      return res.status(200).json({ 
        success: true, 
        exists: false,
        message: 'No user found with this wallet address',
        walletAddress
      });
    }

    return res.json({
      success: true,
      exists: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user by wallet:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;