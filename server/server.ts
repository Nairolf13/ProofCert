import express from 'express';
import { corsMiddleware } from './middlewares/cors.ts';
import authRoutes from './routes/auth.ts';
import proofsRoutes from './routes/proofs.ts';
import favoritesRoutes from './routes/favorites.ts';
import helmet from 'helmet';
import cookie from 'cookie';
import { propertyRentalRouter } from './routes/auth.ts';
import userRoutes from './routes/user.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());

// Middleware silencieux pour les cookies
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = cookieHeader ? cookie.parse(cookieHeader) : {};
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'ProofCert API',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/proofs', proofsRoutes);
app.use('/api/share', proofsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api', propertyRentalRouter);
app.use('/api/users', userRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Access locally at http://localhost:${PORT}`);
});

export default app;
