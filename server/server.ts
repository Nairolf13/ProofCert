import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { parse as parseCookie } from 'cookie';
import { corsMiddleware } from './middlewares/cors.js';
import authRoutes from './routes/auth.js';
import proofsRoutes from './routes/proofs.js';
import favoritesRoutes from './routes/favorites.js';
import helmet from 'helmet';
import propertyRentalRouter from './routes/propertyRental.js';
import userRoutes from './routes/user.js';

// Configuration de l'environnement
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

// Initialisation de l'application Express
const app: Express = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Log du répertoire de l'application
const appDir = dirname(fileURLToPath(import.meta.url));
console.log(`Application directory: ${appDir}`);

// Augmenter la limite de taille pour les requêtes JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de sécurité
app.use(helmet());

// Middleware CORS
app.use(corsMiddleware);

// Middleware pour parser les cookies
app.use((req: Request, res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = cookieHeader ? parseCookie(cookieHeader) : {};
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/proofs', proofsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api', propertyRentalRouter);

// Route de santé
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'ProofCert API',
    version: '1.0.0'
  });
});

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Gestion des erreurs globales
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  next(err);
});

// Démarrer le serveur
const startServer = async (): Promise<void> => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Gestion de l'arrêt propre du serveur
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    
    try {
      server.close((err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }
        console.log('Server closed');
        process.exit(0);
      });
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Gestion des signaux d'arrêt
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Démarrer l'application
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  // En production, vous pourriez vouloir redémarrer le processus ici
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // En production, vous pourriez vouloir redémarrer le processus ici
  process.exit(1);
});

export default app;
