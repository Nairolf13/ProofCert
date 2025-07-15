import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middlewares/cors.js';
import authRoutes from './routes/auth.js';
import proofsRoutes from './routes/proofs.js';
import favoritesRoutes from './routes/favorites.js';
import helmet from 'helmet';
import cookie from 'cookie';
import propertyRentalRouter from './routes/propertyRental.js';
import userRoutes from './routes/user.js';
// Configuration des chemins de fichiers
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialisation des chemins de fichiers
const appDir = dirname(fileURLToPath(import.meta.url));
console.log(`Application directory: ${appDir}`);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Augmenter la limite de taille pour les requêtes JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de sécurité
app.use(helmet());

// Middleware CORS
app.use(corsMiddleware);

// Middleware pour parser les cookies
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = cookieHeader ? cookie.parse(cookieHeader) : {};
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/proofs', proofsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api', propertyRentalRouter);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'ProofCert API',
    version: '1.0.0'
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Gestion des erreurs globales
// Gestion des erreurs globales
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
  next(err);
});

// Démarrer le serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // En production, vous pourriez vouloir redémarrer le processus ici
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // En production, vous pourriez vouloir redémarrer le processus ici
  process.exit(1);
});

// Gestion de la sortie propre
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
