import IORedis from 'ioredis';
import { env } from './env.js';

const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 1000, 30000);
    console.log(`Redis retry attempt ${times}, next in ${delay}ms`);
    return delay;
  },
  lazyConnect: true,
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect in background — don't crash the server if Redis is unavailable
redisConnection.connect().catch((err) => {
  console.warn('Redis initial connection failed (will keep retrying):', err.message);
});

export { redisConnection };
