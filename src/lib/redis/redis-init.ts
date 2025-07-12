import { redisClient } from './redis-client';

// Initialisation de la connexion Redis au démarrage
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connection initialized');
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    process.exit(1);
  }
};

// Gestion de la fermeture propre
const handleShutdown = async () => {
  try {
    await redisClient.disconnect();
    console.log('Redis connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// Initialisation
if (process.env.NODE_ENV !== 'test') {
  initializeRedis().catch(console.error);
}
