import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.ts';

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

router.post('/login', (async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const normalizedEmailOrUsername = emailOrUsername.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: { OR: [ { email: normalizedEmailOrUsername }, { username: emailOrUsername } ] }
    });
    if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler);

// @ts-expect-error Express 5 type inference bug with custom req.user
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

// @ts-expect-error Express 5 type inference bug with custom req.user
router.get('/me', authenticateToken, ((req, res) => {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const userWithoutPassword = { ...req.user };
  if ('hashedPassword' in userWithoutPassword) {
    delete (userWithoutPassword as { hashedPassword?: string }).hashedPassword;
  }
  res.json({ user: userWithoutPassword });
}) as import('express').RequestHandler);

// @ts-expect-error Express 5 type inference bug with custom req.user
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

export default router;
