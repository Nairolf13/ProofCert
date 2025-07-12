import { createClient } from 'redis';
import { redisConfig } from '../../config/redis.config';

class RedisClient {
  private static instance: RedisClient;
  private client: ReturnType<typeof createClient>;

  private constructor() {
    const clientOptions = {
      url: redisConfig.url,
      password: redisConfig.password,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Too many Redis reconnection attempts');
            return new Error('Could not connect to Redis');
          }
          return Math.min(retries * 100, 5000);
        }
      },
      ...(redisConfig.tls && { tls: { rejectUnauthorized: false } })
    };

    this.client = createClient(clientOptions);

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient() {
    return this.client;
  }

  public async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async disconnect() {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }
}

export const redisClient = RedisClient.getInstance();
