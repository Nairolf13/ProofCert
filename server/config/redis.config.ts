import { RedisConfig } from '../../src/types/redis';

export const redisConfig: RedisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true'
} as const;
