import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis.js';

interface EmailJobData {
  campaignId: string;
  campaignContactId: string;
  contactId: string;
  stepId: string;
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  smtpAccountId: string;
}

export function startEmailWorker() {
  const worker = new Worker<EmailJobData>(
    'email-sending',
    async (job: Job<EmailJobData>) => {
      console.log(`Processing email job ${job.id} to ${job.data.to}`);

      // TODO: Implement actual email sending logic:
      // 1. Fetch SMTP account and decrypt password
      // 2. Create Nodemailer transporter
      // 3. Send email with tracking pixel and link wrapping
      // 4. Record campaign_activity (sent/error)
      // 5. Update campaign_contact status and next_send_at
      // 6. Check daily send limits

      console.log(`Email job ${job.id} completed (stub)`);
    },
    {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000, // Max 10 emails per second
      },
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  return worker;
}
