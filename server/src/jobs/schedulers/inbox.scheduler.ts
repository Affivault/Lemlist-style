import { supabaseAdmin } from '../../config/supabase.js';
import { inboxSyncQueue } from '../queues.js';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Periodically enqueue inbox sync jobs for all active SMTP accounts.
 * Runs every 5 minutes.
 */
export function scheduleInboxSync() {
  if (!inboxSyncQueue) {
    console.log('Inbox sync scheduler skipped — no Redis connection');
    return;
  }
  const queue = inboxSyncQueue;
  async function syncAll() {
    try {
      // Get all verified, active SMTP accounts
      const { data: accounts } = await supabaseAdmin
        .from('smtp_accounts')
        .select('id, user_id, smtp_host, email_address')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (!accounts || accounts.length === 0) return;

      for (const account of accounts) {
        await queue.add(
          `inbox-sync-${account.id}`,
          {
            userId: account.user_id,
            smtpAccountId: account.id,
            imapHost: '', // Worker will derive from SMTP host
            imapPort: 993,
            imapSecure: true,
            imapUser: account.email_address,
          },
          {
            // Deduplicate: don't enqueue if already pending for this account
            jobId: `inbox-${account.id}-${Math.floor(Date.now() / SYNC_INTERVAL_MS)}`,
          }
        );
      }
    } catch (err) {
      console.error('Inbox sync scheduler error:', err);
    }
  }

  // Run immediately then on interval
  syncAll();
  setInterval(syncAll, SYNC_INTERVAL_MS);
}
