import { createClient } from 'redis';
import { redisConfig } from '../../config/redis.config';
import type { RedisSocketOptions } from '../../types/redis';

class RedisClient {
  private static instance: RedisClient;
  private client: ReturnType<typeof createClient>;

  private constructor() {
    const socketOptions: Partial<RedisSocketOptions> = {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error('Too many Redis reconnection attempts');
          return new Error('Could not connect to Redis');
        }
        return Math.min(retries * 100, 5000);
      }
    };

    if (redisConfig.tls) {
      socketOptions.tls = { rejectUnauthorized: false };
    }

    this.client = createClient({
      url: redisConfig.url,
      socket: socketOptions
    });

    this.initializeEventHandlers();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private initializeEventHandlers(): void {
    this.client.on('error', (err) => 
      console.error('Redis Client Error:', err)
    );
    
    this.client.on('connect', () => 
      console.log('Redis Client Connected')
    );
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  public getClient() {
    return this.client;
  }
}

export const redisClient = RedisClient.getInstance();
