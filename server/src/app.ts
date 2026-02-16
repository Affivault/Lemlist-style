import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middleware/error.middleware.js';
import { routes } from './routes/index.js';
import { assetController } from './controllers/asset.controller.js';
import { webhookInboundRoutes } from './routes/webhook-inbound.routes.js';
import { trackingRoutes } from './routes/tracking.routes.js';

const app = express();

// Middleware
app.use(helmet());

// CORS — reflect any origin (all routes require JWT auth so this is safe)
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public asset render endpoint (no auth - used in email images)
app.get('/api/assets/render/:templateId', assetController.render);

// Public inbound webhook endpoint (no auth - external systems call this)
app.use('/api/webhooks/inbound', webhookInboundRoutes);

// Public tracking endpoints (no auth - used in email opens/clicks)
app.use('/api/track', trackingRoutes);

// Routes (authenticated)
app.use('/api/v1', routes);

// Health check with diagnostics
app.get('/health', async (_req, res) => {
  const diagnostics: Record<string, any> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: 'v5-resend-integration',
  };

  // Check Redis
  try {
    const { redisConnection } = await import('./config/redis.js');
    if (redisConnection.status === 'ready') {
      diagnostics.redis = 'connected';
    } else {
      diagnostics.redis = `status: ${redisConnection.status}`;
    }
  } catch (err: any) {
    diagnostics.redis = `error: ${err.message}`;
  }

  // Check Supabase connectivity
  try {
    const { supabaseAdmin } = await import('./config/supabase.js');
    const { count, error } = await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact', head: true });
    diagnostics.supabase = error ? `error: ${error.message}` : `ok (${count} campaigns)`;
  } catch (err: any) {
    diagnostics.supabase = `error: ${err.message}`;
  }

  // Check SMTP accounts
  try {
    const { supabaseAdmin } = await import('./config/supabase.js');
    const { data: accounts } = await supabaseAdmin
      .from('smtp_accounts')
      .select('id, label, is_active, is_verified, email_address');
    diagnostics.smtp_accounts = (accounts || []).map((a: any) => ({
      label: a.label,
      email: a.email_address,
      active: a.is_active,
      verified: a.is_verified,
    }));
  } catch (err: any) {
    diagnostics.smtp_accounts = `error: ${err.message}`;
  }

  // Check running campaigns
  try {
    const { supabaseAdmin } = await import('./config/supabase.js');
    const { data: running } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, status, started_at')
      .eq('status', 'running');
    diagnostics.running_campaigns = running || [];

    // Check due contacts
    const { data: dueContacts, error: dueErr } = await supabaseAdmin
      .from('campaign_contacts')
      .select('id, campaign_id, status, current_step_order, next_send_at, error_message')
      .eq('status', 'active')
      .not('next_send_at', 'is', null)
      .lte('next_send_at', new Date().toISOString())
      .limit(10);
    diagnostics.due_contacts = dueErr ? `error: ${dueErr.message}` : (dueContacts || []);
  } catch (err: any) {
    diagnostics.running_campaigns = `error: ${err.message}`;
  }

  res.json(diagnostics);
});

// Diagnostic: attempt to send a real test email via Resend or SMTP
// Usage: POST /debug/send-email { "to": "you@gmail.com" }
app.post('/debug/send-email', async (req, res) => {
  const steps: string[] = [];
  try {
    const { to } = req.body || {};
    if (!to) {
      return res.status(400).json({ error: 'POST body must include "to" email address' });
    }
    steps.push(`1. Target: ${to}`);

    const { env } = await import('./config/env.js');
    const { sendSimpleEmail } = await import('./services/email-sender.service.js');
    const { supabaseAdmin } = await import('./config/supabase.js');
    const { decrypt } = await import('./utils/encryption.js');

    // Check Resend config
    if (env.RESEND_API_KEY) {
      steps.push(`2. Resend API key configured (${env.RESEND_API_KEY.slice(0, 8)}...)`);
      steps.push(`   RESEND_FROM_EMAIL: ${env.RESEND_FROM_EMAIL || '(not set — will use SMTP account email)'}`);
    } else {
      steps.push('2. Resend NOT configured — will try SMTP (may fail on Render free tier)');
    }

    // Find SMTP account for from address / fallback
    const { data: accounts } = await supabaseAdmin
      .from('smtp_accounts')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    const account = accounts?.[0];
    if (account) {
      steps.push(`3. SMTP account found: ${account.label} (${account.email_address})`);
    } else {
      steps.push('3. No SMTP accounts found in database');
    }

    // Attempt to send
    let password: string | undefined;
    if (account) {
      try {
        password = decrypt(account.smtp_pass_encrypted);
        steps.push('4. SMTP password decrypted OK');
      } catch (err: any) {
        steps.push(`4. SMTP password decrypt failed: ${err.message}`);
      }
    } else {
      steps.push('4. No SMTP account to decrypt password for');
    }

    steps.push('5. Attempting to send email...');
    const result = await sendSimpleEmail({
      from: account?.email_address || 'noreply@skysend.io',
      to,
      subject: `[SkySend Debug] Test at ${new Date().toISOString()}`,
      html: '<h2>SkySend Debug Test</h2><p>If you see this email, your email sending is working correctly.</p>',
      smtpAccount: account,
      smtpPassword: password,
    });

    steps.push(`6. EMAIL SENT OK via ${result.provider} — messageId: ${result.messageId}`);

    // Auto-verify SMTP account
    if (account) {
      await supabaseAdmin
        .from('smtp_accounts')
        .update({ is_verified: true })
        .eq('id', account.id);
      steps.push('7. SMTP account marked as verified');
    }

    res.json({ success: true, provider: result.provider, steps });
  } catch (err: any) {
    steps.push(`FAIL: ${err.message}`);
    res.json({ success: false, steps });
  }
});

// Error handler (must be last)
app.use(errorMiddleware);

export { app };
