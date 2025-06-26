import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.ts';
import rateLimit from 'express-rate-limit';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.ts';
import { hashToken, compareToken } from '../utils/hash.ts';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware global (à mettre dans server.ts)
// app.use(helmet());
// app.use(cookieParser());

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

// LOGIN
// @ts-expect-error Express 5 async handler type workaround
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const normalizedEmailOrUsername = emailOrUsername.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: { OR: [ { email: normalizedEmailOrUsername }, { username: emailOrUsername } ] }
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });
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
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/auth/refresh',
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, accessToken });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

// REFRESH
// @ts-expect-error Express 5 async handler type workaround
router.post('/refresh', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    // On doit trouver le refresh token correspondant à l'utilisateur et au token reçu
    const dbToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: await hashToken(refreshToken),
        expiresAt: { gt: new Date() }
      }
    });
    if (!dbToken) return res.sendStatus(403);
    const valid = await compareToken(refreshToken, dbToken.tokenHash);
    if (!valid) return res.sendStatus(403);
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
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/auth/refresh',
    });
    const accessToken = generateAccessToken(dbToken.userId);
    res.json({ accessToken });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

// LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { /* Optionally: match by user, ip, or token hash */ } });
    }
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    res.sendStatus(204);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}) as import('express').RequestHandler;

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
