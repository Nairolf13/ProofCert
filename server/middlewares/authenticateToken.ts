import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Type pour l'utilisateur authentifié
export type AuthenticatedUser = Omit<User, 'hashedPassword'> & {
  hashedPassword: string;
};

// Extension de l'interface Request
declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

// Type pour les requêtes authentifiées
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  const walletAddress = req.headers['x-wallet-address'] as string | undefined;

  try {
    // Authentification par wallet
    if (walletAddress && !token) {
      const user = await prisma.user.findFirst({
        where: { walletAddress }
      });

      if (user) {
        (req as AuthenticatedRequest).user = user;
        return next();
      }
    }

    // Authentification par token JWT
    if (token) {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      (req as AuthenticatedRequest).user = user;
      return next();
    }

    // Aucune méthode d'authentification valide
    res.status(401).json({ error: 'Authentification requise' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Token invalide' });
      return;
    }
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
