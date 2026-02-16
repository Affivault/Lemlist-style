import { app } from './app.js';
import { env } from './config/env.js';
import { startEmailWorker } from './jobs/workers/email.worker.js';
import { startSequenceWorker } from './jobs/workers/sequence.worker.js';
import { startInboxWorker } from './jobs/workers/inbox.worker.js';
import { scheduleInboxSync } from './jobs/schedulers/inbox.scheduler.js';

const port = parseInt(env.PORT, 10);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API: ${env.API_BASE_URL}/api/v1`);
  console.log(`Health: ${env.API_BASE_URL}/health`);

  // Start background workers
  try {
    startEmailWorker();
    console.log('Email worker started');
  } catch (err: any) {
    console.warn('Email worker failed to start (Redis may not be available):', err.message);
  }

  try {
    startSequenceWorker();
    console.log('Sequence worker started');
  } catch (err: any) {
    console.warn('Sequence worker failed to start:', err.message);
  }

  try {
    startInboxWorker();
    console.log('Inbox sync worker started');
  } catch (err: any) {
    console.warn('Inbox worker failed to start:', err.message);
  }

  // Schedule periodic inbox sync (every 5 minutes)
  try {
    scheduleInboxSync();
    console.log('Inbox sync scheduler started');
  } catch (err: any) {
    console.warn('Inbox scheduler failed to start:', err.message);
  }
});
