import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export let emailQueue: Queue | null = null;
export let inboxSyncQueue: Queue | null = null;

if (redisConnection) {
  emailQueue = new Queue('email-sending', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });

  inboxSyncQueue = new Queue('inbox-sync', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 10000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
}
