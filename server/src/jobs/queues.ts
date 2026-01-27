import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const emailQueue = new Queue('email-sending', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const inboxSyncQueue = new Queue('inbox-sync', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
