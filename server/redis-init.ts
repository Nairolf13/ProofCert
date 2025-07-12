import { redisClient } from './lib/redis/redis-client';

// Initialisation de la connexion Redis au démarrage du serveur
const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    throw error; // Propager l'erreur pour la gestion au niveau supérieur
  }
};

// Gestion de la fermeture propre
const cleanup = async (): Promise<void> => {
  try {
    await redisClient.disconnect();
    console.log('🔌 Redis connection closed');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
    throw error; // Propager l'erreur pour la gestion au niveau supérieur
  }
};

// Gestion des signaux d'arrêt
const setupSignalHandlers = (): void => {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\nReceived ${signal}. Cleaning up...`);
      try {
        await cleanup();
        console.log('✅ Cleanup complete. Exiting...');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
      }
    });
  });

  // Gestion des erreurs non capturées
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    cleanup().finally(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason) => {
    console.error('🚨 Unhandled Rejection at:', reason);
    cleanup().finally(() => process.exit(1));
  });
};

// Initialiser les gestionnaires de signaux au chargement du module
setupSignalHandlers();

export { initializeRedis, cleanup };
