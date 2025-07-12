import { SocketOptions } from 'redis';

export interface RedisSocketOptions extends Omit<SocketOptions, 'reconnectStrategy'> {
  reconnectStrategy?: (retries: number) => number | Error;
}

export interface RedisConfig {
  url: string;
  ttl: number;
  password?: string;
  tls: boolean;
}
