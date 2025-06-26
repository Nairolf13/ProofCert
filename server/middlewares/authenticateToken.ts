import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends express.Request {
  user?: User;
}

const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  prisma.user
    .findUnique({ where: { id: decoded.userId } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      (req as { user?: User }).user = user;
      next();
    })
    .catch(() => res.status(500).json({ error: 'Internal server error' }));
};

export { authenticateToken };
