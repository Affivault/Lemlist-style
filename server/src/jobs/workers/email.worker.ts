import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis.js';
import { supabaseAdmin } from '../../config/supabase.js';
import { fireEvent } from '../../services/webhook.service.js';
import { processNextStep } from '../../services/sequence.service.js';

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
      const { campaignId, campaignContactId, contactId, stepId, to, subject, bodyHtml, bodyText } = job.data;
      console.log(`Processing email job ${job.id} to ${to}`);

      try {
        // TODO: Full SMTP sending implementation:
        // 1. Call sse.selectBestSender() to pick best SMTP account
        // 2. Fetch SMTP account and decrypt password
        // 3. Create Nodemailer transporter
        // 4. Send email with tracking pixel and link wrapping
        // 5. Call sse.recordSend() to update account stats

        // Record campaign activity (sent)
        await supabaseAdmin
          .from('campaign_activities')
          .insert({
            campaign_id: campaignId,
            campaign_contact_id: campaignContactId,
            contact_id: contactId,
            step_id: stepId,
            activity_type: 'sent',
            metadata: { subject, to },
          });

        // Fire webhook event for email sent
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('user_id')
          .eq('id', campaignId)
          .single();

        if (campaign) {
          fireEvent(campaign.user_id, 'email.sent', {
            campaign_id: campaignId,
            contact_id: contactId,
            step_id: stepId,
            to,
            subject,
          }).catch(() => {});
        }

        // Advance to next step in sequence
        // Find all steps to calculate next step order
        const { data: currentStep } = await supabaseAdmin
          .from('campaign_steps')
          .select('step_order')
          .eq('id', stepId)
          .single();

        if (currentStep) {
          const { data: allSteps } = await supabaseAdmin
            .from('campaign_steps')
            .select('step_order')
            .eq('campaign_id', campaignId)
            .order('step_order');

          const nextStepOrder = currentStep.step_order + 1;
          const hasMoreSteps = allSteps?.some((s: any) => s.step_order === nextStepOrder);

          if (hasMoreSteps) {
            // Set next step - the sequence worker timer will pick it up
            await supabaseAdmin
              .from('campaign_contacts')
              .update({
                current_step_order: nextStepOrder,
                next_send_at: new Date().toISOString(),
                last_step_at: new Date().toISOString(),
              })
              .eq('id', campaignContactId);
          } else {
            // No more steps - mark complete
            await supabaseAdmin
              .from('campaign_contacts')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                last_step_at: new Date().toISOString(),
              })
              .eq('id', campaignContactId);

            if (campaign) {
              fireEvent(campaign.user_id, 'campaign.completed', {
                campaign_id: campaignId,
                contact_id: contactId,
              }).catch(() => {});
            }
          }
        }

        console.log(`Email job ${job.id} completed - sent to ${to}`);
      } catch (err: any) {
        console.error(`Email job ${job.id} send error:`, err.message);

        // Record activity as error
        await supabaseAdmin
          .from('campaign_activities')
          .insert({
            campaign_id: campaignId,
            campaign_contact_id: campaignContactId,
            contact_id: contactId,
            step_id: stepId,
            activity_type: 'error',
            metadata: { error: err.message, to },
          });

        throw err; // Let BullMQ handle retries
      }
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
