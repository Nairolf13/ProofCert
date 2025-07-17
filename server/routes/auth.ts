import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import rateLimit from 'express-rate-limit';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { hashToken, compareToken } from '../utils/hash.js';
import propertyRentalRouter from './propertyRental.js';
import type { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', (async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findFirst({
      where: { OR: [ { email: normalizedEmail }, { username } ] }
    });
    if (existingUser) { res.status(400).json({ error: 'User with this email or username already exists' }); return; }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, username, hashedPassword },
      select: { id: true, email: true, username: true, walletAddress: true, createdAt: true, updatedAt: true }
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler);

router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const normalizedEmailOrUsername = emailOrUsername.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: { OR: [ { email: normalizedEmailOrUsername }, { username: emailOrUsername } ] },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profileImage: true
      }
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // On récupère le hash du mot de passe pour la vérification
    const userForPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { hashedPassword: true }
    });
    if (!userForPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const isValidPassword = await bcrypt.compare(password, userForPassword.hashedPassword);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashToken(refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/api/auth/refresh', 
    });
    res.json({ user, accessToken });
  } catch (err) {
    console.error('Erreur /api/auth/login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

router.post('/refresh', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
    // Correction: bcrypt hash cannot be searched directly, must compare all valid tokens
    const dbTokens = await prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } }
    });
    let dbToken: typeof dbTokens[0] | null = null;
    for (const tokenRecord of dbTokens) {
      if (await compareToken(refreshToken, tokenRecord.tokenHash)) {
        dbToken = tokenRecord;
        break;
      }
    }
    if (!dbToken) return res.status(403).json({ error: 'Invalid refresh token' });
    // Rotation: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: dbToken.id } });
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = await hashToken(newRefreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: dbToken.userId,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/api/auth/refresh', // Correction ici
    });
    const accessToken = generateAccessToken(dbToken.userId);
    res.json({ accessToken });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const dbTokens = await prisma.refreshToken.findMany({
        where: { expiresAt: { gt: new Date() } }
      });
      for (const tokenRecord of dbTokens) {
        if (await compareToken(refreshToken, tokenRecord.tokenHash)) {
          await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
          break;
        }
      }
    }
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.status(204).json({ message: 'Logged out' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

router.post('/connect-wallet', authenticateToken, ((req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { walletAddress } = req.body;
  const userId = req.user.id;
  prisma.user.update({
    where: { id: userId },
    data: { walletAddress },
    select: { id: true, email: true, username: true, walletAddress: true, createdAt: true, updatedAt: true }
  })
    .then(updatedUser => { res.json({ user: updatedUser }); })
    .catch(() => { res.status(500).json({ error: 'Internal server error' }); });
}) as import('express').RequestHandler);

router.get('/me', authenticateToken, ((req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userWithoutPassword = { ...req.user };
  if ('hashedPassword' in userWithoutPassword) {
    delete (userWithoutPassword as { hashedPassword?: string }).hashedPassword;
  }
  res.json({ user: userWithoutPassword });
}) as import('express').RequestHandler);

router.patch('/profile-image', authenticateToken, async (req, res) => {

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { profileImage } = req.body;
  if (!profileImage) return res.status(400).json({ error: 'Missing profileImage' });
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage },
      select: { id: true, email: true, username: true, walletAddress: true, createdAt: true, updatedAt: true, profileImage: true }
    });
    res.json({ user: updatedUser });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

// PATCH /api/auth/role : permet à un utilisateur de devenir OWNER (ou de changer de rôle)
router.patch('/role', authenticateToken, async (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { role } = req.body;
  // Empêcher la modification du rôle si l'utilisateur est ADMIN
  if (req.user.role === 'ADMIN') {
    return res.status(403).json({ error: 'Impossible de modifier le rôle d\'un administrateur.' });
  }
  if (!role || (role !== 'OWNER' && role !== 'TENANT')) {
    res.status(400).json({ error: 'Invalid role' }); return;
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { role },
      select: { id: true, email: true, username: true, walletAddress: true, createdAt: true, updatedAt: true, role: true }
    });
    // Générer un nouveau token JWT avec le rôle mis à jour
    const accessToken = generateAccessToken(updatedUser.id);
    res.json({ user: updatedUser, accessToken });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

// PATCH /api/auth/admin/update-role : permet à un administrateur de mettre à jour le rôle d'un autre utilisateur
router.patch('/admin/update-role', authenticateToken, async (req, res) => {
  if (!req.user || req.user.role !== 'ADMIN') { 
    res.status(403).json({ error: 'Forbidden: Admin access required' }); 
    return; 
  }
  
  const { userId, role } = req.body;
  
  if (!userId || !role || (role !== 'ADMIN' && role !== 'OWNER' && role !== 'TENANT')) {
    res.status(400).json({ 
      error: 'Invalid request',
      details: 'Both userId and role (ADMIN, OWNER, or TENANT) are required' 
    }); 
    return;
  }
  
  try {
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { 
        id: true, 
        email: true, 
        username: true, 
        walletAddress: true, 
        role: true,
        createdAt: true, 
        updatedAt: true 
      }
    });
    
    res.json({ 
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}) as import('express').RequestHandler;

// Ajoute ce router à l'export (à utiliser dans server.ts)
export { propertyRentalRouter };

// Endpoint pour récupérer les informations de l'utilisateur connecté
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du profil' });
  }
});

export default router;
