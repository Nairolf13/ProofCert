import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): boolean {
  return typeof token === 'string' && token.length === 128;
}
