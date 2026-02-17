import { Worker, Job } from 'bullmq';
import { ImapFlow } from 'imapflow';
import { redisConnection } from '../../config/redis.js';
import { supabaseAdmin } from '../../config/supabase.js';
import { decrypt } from '../../utils/encryption.js';
import { fireEvent } from '../../services/webhook.service.js';
import { processReply } from '../../services/sara.service.js';

interface InboxSyncJobData {
  userId: string;
  smtpAccountId: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapUser: string;
}

/**
 * Extract plain text body from raw email source.
 */
function extractTextBody(source: string): string {
  // Try to find text/plain section
  const textMatch = source.match(
    /Content-Type:\s*text\/plain[^\r\n]*\r\n(?:Content-Transfer-Encoding:[^\r\n]*\r\n)?\r\n([\s\S]*?)(?:\r\n--|\r\n\.\r\n|$)/i
  );
  if (textMatch) return textMatch[1].trim();

  // Fallback: strip HTML
  const htmlMatch = source.match(
    /Content-Type:\s*text\/html[^\r\n]*\r\n(?:Content-Transfer-Encoding:[^\r\n]*\r\n)?\r\n([\s\S]*?)(?:\r\n--|\r\n\.\r\n|$)/i
  );
  if (htmlMatch) return htmlMatch[1].replace(/<[^>]*>/g, '').trim();

  // Last resort: after headers
  const bodyStart = source.indexOf('\r\n\r\n');
  return bodyStart !== -1 ? source.slice(bodyStart + 4).trim() : '';
}

export function startInboxWorker() {
  if (!redisConnection) {
    console.log('Inbox worker skipped — no Redis connection');
    return null;
  }
  const worker = new Worker<InboxSyncJobData>(
    'inbox-sync',
    async (job: Job<InboxSyncJobData>) => {
      const { userId, smtpAccountId } = job.data;
      console.log(`Processing inbox sync job ${job.id} for account ${smtpAccountId}`);

      // 1. Get SMTP account details and decrypt password
      const { data: account } = await supabaseAdmin
        .from('smtp_accounts')
        .select('smtp_pass_encrypted, smtp_host, email_address, last_inbox_sync_at')
        .eq('id', smtpAccountId)
        .single();

      if (!account) {
        console.error(`SMTP account ${smtpAccountId} not found`);
        return;
      }

      const password = decrypt(account.smtp_pass_encrypted);
      const emailDomain = account.email_address?.split('@')[1] || '';

      // Derive IMAP host from SMTP host or email domain
      let imapHost = job.data.imapHost;
      if (!imapHost) {
        if (account.smtp_host?.includes('smtp.gmail')) imapHost = 'imap.gmail.com';
        else if (account.smtp_host?.includes('smtp.outlook') || account.smtp_host?.includes('office365')) imapHost = 'outlook.office365.com';
        else if (account.smtp_host?.includes('smtp.')) imapHost = account.smtp_host.replace('smtp.', 'imap.');
        else imapHost = `imap.${emailDomain}`;
      }

      // 2. Connect to IMAP
      const client = new ImapFlow({
        host: imapHost,
        port: job.data.imapPort || 993,
        secure: job.data.imapSecure !== false,
        auth: {
          user: job.data.imapUser || account.email_address,
          pass: password,
        },
        logger: false,
      });

      try {
        await client.connect();
        await client.mailboxOpen('INBOX');

        // 3. Fetch messages since last sync (or last 7 days)
        const sinceDate = account.last_inbox_sync_at
          ? new Date(account.last_inbox_sync_at)
          : new Date(Date.now() - 7 * 24 * 3600 * 1000);

        let repliesProcessed = 0;
        let totalChecked = 0;

        for await (const msg of client.fetch(
          { since: sinceDate },
          { envelope: true, source: true }
        )) {
          totalChecked++;
          const envelope = msg.envelope;
          if (!envelope) continue;

          const fromEmail = envelope.from?.[0]?.address || '';
          const toEmail = envelope.to?.[0]?.address || '';
          const subject = envelope.subject || '';
          const messageId = envelope.messageId || '';
          const inReplyTo = envelope.inReplyTo || '';
          const source = msg.source?.toString() || '';
          const bodyText = extractTextBody(source);

          // 4. Skip if already stored (deduplicate by message_id)
          if (messageId) {
            const { count } = await supabaseAdmin
              .from('inbox_messages')
              .select('*', { count: 'exact', head: true })
              .eq('message_id', messageId);
            if (count && count > 0) continue;
          }

          // 5. Match to campaign contact
          let matchedActivity: any = null;

          // Method 1: In-Reply-To header matches our sent message_id
          if (inReplyTo) {
            const { data } = await supabaseAdmin
              .from('campaign_activities')
              .select('campaign_id, campaign_contact_id, contact_id, step_id')
              .eq('activity_type', 'sent')
              .eq('message_id', inReplyTo)
              .single();
            matchedActivity = data;
          }

          // Method 2: From email matches a contact in an active campaign
          if (!matchedActivity && fromEmail) {
            const { data: contact } = await supabaseAdmin
              .from('contacts')
              .select('id')
              .eq('email', fromEmail)
              .eq('user_id', userId)
              .single();

            if (contact) {
              const { data: cc } = await supabaseAdmin
                .from('campaign_contacts')
                .select('id, campaign_id, contact_id')
                .eq('contact_id', contact.id)
                .in('status', ['active', 'completed'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (cc) {
                matchedActivity = {
                  campaign_id: cc.campaign_id,
                  campaign_contact_id: cc.id,
                  contact_id: cc.contact_id,
                };
              }
            }
          }

          // 6. Store in inbox_messages
          const inboxRow: any = {
            user_id: userId,
            from_email: fromEmail,
            to_email: toEmail,
            subject,
            body_text: bodyText,
            message_id: messageId || undefined,
            in_reply_to: inReplyTo || undefined,
            is_read: false,
            received_at: envelope.date || new Date().toISOString(),
          };
          if (matchedActivity) {
            inboxRow.campaign_id = matchedActivity.campaign_id;
            inboxRow.contact_id = matchedActivity.contact_id;
          }

          const { data: saved } = await supabaseAdmin
            .from('inbox_messages')
            .insert(inboxRow)
            .select('id')
            .single();

          // 7. If matched, record reply activity and run SARA
          if (matchedActivity) {
            await supabaseAdmin
              .from('campaign_activities')
              .insert({
                campaign_id: matchedActivity.campaign_id,
                campaign_contact_id: matchedActivity.campaign_contact_id,
                contact_id: matchedActivity.contact_id,
                step_id: matchedActivity.step_id || null,
                activity_type: 'replied',
                message_id: messageId,
                metadata: { from: fromEmail, subject, inbox_message_id: saved?.id },
              });

            fireEvent(userId, 'email.replied', {
              campaign_id: matchedActivity.campaign_id,
              contact_id: matchedActivity.contact_id,
              from: fromEmail,
              subject,
            }).catch(() => {});

            // Run SARA classification
            if (saved?.id) {
              try { await processReply(saved.id); }
              catch (e) { console.error('SARA error:', e); }
            }

            repliesProcessed++;
          }
        }

        // 8. Update last sync timestamp
        await supabaseAdmin
          .from('smtp_accounts')
          .update({ last_inbox_sync_at: new Date().toISOString() })
          .eq('id', smtpAccountId);

        console.log(`Inbox sync done: ${totalChecked} checked, ${repliesProcessed} replies matched`);
      } catch (err: any) {
        console.error(`IMAP error for ${smtpAccountId}:`, err.message);
        throw err;
      } finally {
        await client.logout().catch(() => {});
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Inbox sync job ${job?.id} failed:`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`Inbox sync job ${job.id} completed`);
  });

  return worker;
}
