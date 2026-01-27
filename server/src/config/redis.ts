import IORedis from 'ioredis';
import { env } from './env.js';

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});
