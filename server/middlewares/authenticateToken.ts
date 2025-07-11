import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';

// Interface pour les requêtes authentifiées
export interface AuthenticatedRequest extends Request {
  user?: User & { walletAddress?: string | null };
}

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  const walletAddress = req.headers['x-wallet-address'] as string | undefined;

  // Si on a une adresse de wallet mais pas de token, on essaie de trouver l'utilisateur par son wallet
  if (walletAddress && !token) {
    try {
      const user = await prisma.user.findFirst({
        where: { walletAddress }
      });

      if (user) {
        (req as AuthenticatedRequest).user = {
          ...user,
          walletAddress: walletAddress || null
        };
        next();
        return;
      }
      // Si l'utilisateur n'est pas trouvé, on continue avec le token JWT
    } catch (error) {
      console.error('Error authenticating with wallet:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Vérification du token JWT standard
  if (!token) {
    res.status(401).json({ error: 'Access token or wallet address required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId } 
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export { authenticateToken };
