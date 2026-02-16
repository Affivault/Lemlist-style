import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import { Resend } from 'resend';
import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import { decrypt } from '../utils/encryption.js';
import { fireEvent } from './webhook.service.js';
import * as sse from './sse.service.js';

/**
 * Direct Email Sender Service
 *
 * Sends campaign emails via Resend HTTP API (primary) or SMTP (fallback).
 * Resend bypasses Render's SMTP port blocking.
 */

// Initialize Resend client if API key is configured
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface SendEmailParams {
  campaignId: string;
  campaignContactId: string;
  contactId: string;
  stepId: string;
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

function generateTrackingId(campaignContactId: string, stepId: string): string {
  const payload = `${campaignContactId}:${stepId}`;
  const hmac = crypto.createHmac('sha256', env.TRACKING_SECRET).update(payload).digest('hex').slice(0, 16);
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

function injectTrackingPixel(html: string, trackingId: string): string {
  const pixelUrl = `${env.TRACKING_BASE_URL}/api/track/open/${trackingId}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;border:0;" alt="" />`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  return html + pixel;
}

function wrapLinks(html: string, trackingId: string): string {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (_match, url) => {
      if (url.includes('/api/track/') || url.includes('unsubscribe')) {
        return `href="${url}"`;
      }
      const encoded = Buffer.from(url).toString('base64url');
      const trackUrl = `${env.TRACKING_BASE_URL}/api/track/click/${trackingId}?url=${encoded}`;
      return `href="${trackUrl}"`;
    }
  );
}

/**
 * Send an email via Resend HTTP API.
 * Returns the message ID on success, throws on failure.
 */
async function sendViaResend(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}): Promise<string> {
  if (!resend) throw new Error('Resend not configured');

  const fromAddress = env.RESEND_FROM_EMAIL || params.from;
  console.log(`[EmailSender:Resend] Sending from ${fromAddress} to ${params.to}`);

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    headers: params.headers,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message} (${error.name})`);
  }

  const messageId = data?.id || `resend-${crypto.randomUUID()}`;
  console.log(`[EmailSender:Resend] Sent OK — id: ${messageId}`);
  return messageId;
}

/**
 * Send an email via SMTP/nodemailer.
 * Returns the message ID on success, throws on failure.
 */
async function sendViaSMTP(params: {
  smtpAccount: any;
  smtpPassword: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  messageId: string;
  headers?: Record<string, string>;
}): Promise<string> {
  console.log(`[EmailSender:SMTP] Connecting to ${params.smtpAccount.smtp_host}:${params.smtpAccount.smtp_port}`);
  const transporter = nodemailer.createTransport({
    host: params.smtpAccount.smtp_host,
    port: params.smtpAccount.smtp_port,
    secure: params.smtpAccount.smtp_secure,
    auth: { user: params.smtpAccount.smtp_user, pass: params.smtpPassword },
    connectionTimeout: 15000,
    socketTimeout: 30000,
  });

  try {
    await transporter.verify();
    console.log(`[EmailSender:SMTP] Connection verified`);
  } catch (verifyErr: any) {
    throw new Error(`SMTP connection failed: ${verifyErr.message}`);
  }

  const info = await transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    messageId: params.messageId,
    headers: params.headers,
  });

  console.log(`[EmailSender:SMTP] Sent OK — messageId: ${info.messageId}`);
  return info.messageId;
}

/**
 * Send a single campaign email.
 * Tries Resend HTTP API first, falls back to SMTP.
 */
export async function sendCampaignEmail(params: SendEmailParams): Promise<void> {
  const { campaignId, campaignContactId, contactId, stepId, to, subject, bodyHtml, bodyText } = params;
  console.log(`[EmailSender] Sending to ${to} (campaign: ${campaignId}, step: ${stepId})`);

  // 1. Get campaign settings
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  // 2. Find SMTP account (needed for from address and SMTP fallback)
  let smtpAccount: any = null;

  const sseResult = await sse.selectBestSender(campaign.user_id, campaignId);
  if (sseResult.account) {
    smtpAccount = sseResult.account;
    console.log(`[EmailSender] SSE selected: ${sseResult.reason}`);
  } else if (campaign.smtp_account_id) {
    const { data: fallback } = await supabaseAdmin
      .from('smtp_accounts')
      .select('*')
      .eq('id', campaign.smtp_account_id)
      .single();
    smtpAccount = fallback;
    console.log(`[EmailSender] Using campaign default SMTP: ${smtpAccount?.label || smtpAccount?.id}`);
  }

  if (!smtpAccount) {
    const { data: anyAccount } = await supabaseAdmin
      .from('smtp_accounts')
      .select('*')
      .eq('user_id', campaign.user_id)
      .eq('is_active', true)
      .limit(1)
      .single();
    if (anyAccount) {
      smtpAccount = anyAccount;
      console.log(`[EmailSender] Last resort SMTP: ${smtpAccount.label || smtpAccount.id}`);
    }
  }

  if (!smtpAccount && !resend) {
    throw new Error('No SMTP account available and Resend is not configured.');
  }

  // 3. Prepare email with tracking
  const trackingId = generateTrackingId(campaignContactId, stepId);
  let finalHtml = bodyHtml;

  const unsubUrl = `${env.TRACKING_BASE_URL}/api/track/unsubscribe/${trackingId}`;
  if (campaign.include_unsubscribe === true) {
    finalHtml = finalHtml.replace(/\{\{unsubscribe_link\}\}/gi, unsubUrl);
    if (!bodyHtml.match(/\{\{unsubscribe_link\}\}/i)) {
      const footer = `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;"><a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a></div>`;
      finalHtml = finalHtml.includes('</body>')
        ? finalHtml.replace('</body>', `${footer}</body>`)
        : finalHtml + footer;
    }
  } else {
    finalHtml = finalHtml.replace(/\{\{unsubscribe_link\}\}/gi, unsubUrl);
  }

  if (campaign.track_clicks !== false) {
    finalHtml = wrapLinks(finalHtml, trackingId);
  }
  if (campaign.track_opens !== false) {
    finalHtml = injectTrackingPixel(finalHtml, trackingId);
  }

  // 4. Send via Resend (primary) or SMTP (fallback)
  const fromAddress = smtpAccount?.email_address || env.RESEND_FROM_EMAIL || 'noreply@skysend.io';
  const domain = fromAddress.split('@')[1] || 'skysend.io';
  const messageId = `<${crypto.randomUUID()}@${domain}>`;
  const headers: Record<string, string> = {
    'X-SkySend-Campaign': campaignId,
    'X-SkySend-Contact': contactId,
    'X-SkySend-Step': stepId,
    ...(campaign.include_unsubscribe === true ? { 'List-Unsubscribe': `<${unsubUrl}>` } : {}),
  };

  let sentMessageId: string;

  if (resend) {
    // Primary: Resend HTTP API (bypasses SMTP port blocks)
    try {
      sentMessageId = await sendViaResend({
        from: fromAddress,
        to, subject, html: finalHtml, text: bodyText, headers,
      });
    } catch (resendErr: any) {
      console.error(`[EmailSender] Resend failed: ${resendErr.message}`);
      // Fall back to SMTP
      if (smtpAccount) {
        console.log('[EmailSender] Falling back to SMTP...');
        const smtpPassword = decrypt(smtpAccount.smtp_pass_encrypted);
        sentMessageId = await sendViaSMTP({
          smtpAccount, smtpPassword, from: fromAddress,
          to, subject, html: finalHtml, text: bodyText, messageId, headers,
        });
      } else {
        throw resendErr;
      }
    }
  } else if (smtpAccount) {
    // Fallback: direct SMTP
    const smtpPassword = decrypt(smtpAccount.smtp_pass_encrypted);
    sentMessageId = await sendViaSMTP({
      smtpAccount, smtpPassword, from: fromAddress,
      to, subject, html: finalHtml, text: bodyText, messageId, headers,
    });
  } else {
    throw new Error('No email transport available');
  }

  console.log(`[EmailSender] Successfully sent to ${to} — messageId: ${sentMessageId}`);

  // 5. Record send in SSE
  if (smtpAccount) {
    await sse.recordSend(smtpAccount.id).catch(() => {});
  }

  // 6. Record campaign activity
  await supabaseAdmin
    .from('campaign_activities')
    .insert({
      campaign_id: campaignId,
      campaign_contact_id: campaignContactId,
      contact_id: contactId,
      step_id: stepId,
      activity_type: 'sent',
      message_id: sentMessageId,
      metadata: {
        subject, to,
        smtp_account_id: smtpAccount?.id,
        smtp_label: smtpAccount?.label,
        tracking_id: trackingId,
        provider: resend ? 'resend' : 'smtp',
      },
    });

  // 7. Fire webhook
  fireEvent(campaign.user_id, 'email.sent', {
    campaign_id: campaignId,
    contact_id: contactId,
    step_id: stepId,
    to, subject,
    message_id: sentMessageId,
  }).catch(() => {});

  // 8. Advance to next step
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
      const delayMin = campaign.delay_between_emails_min ?? campaign.delay_between_emails ?? 60;
      const delayMax = campaign.delay_between_emails_max ?? campaign.delay_between_emails ?? 60;
      const delaySecs = delayMin + Math.floor(Math.random() * (delayMax - delayMin + 1));
      const nextSendAt = new Date(Date.now() + delaySecs * 1000);
      console.log(`[EmailSender] Next step in ${delaySecs}s (range: ${delayMin}-${delayMax}s)`);
      await supabaseAdmin
        .from('campaign_contacts')
        .update({ current_step_order: nextStepOrder, next_send_at: nextSendAt.toISOString() })
        .eq('id', campaignContactId);
    } else {
      await supabaseAdmin
        .from('campaign_contacts')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', campaignContactId);

      fireEvent(campaign.user_id, 'campaign.completed', {
        campaign_id: campaignId,
        contact_id: contactId,
      }).catch(() => {});
    }
  }
}

/**
 * Send a simple email (for test emails, debug, etc.)
 * Uses Resend if available, otherwise SMTP.
 */
export async function sendSimpleEmail(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  smtpAccount?: any;
  smtpPassword?: string;
}): Promise<{ messageId: string; provider: string }> {
  if (resend) {
    const fromAddress = env.RESEND_FROM_EMAIL || params.from;
    try {
      const messageId = await sendViaResend({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || params.html.replace(/<[^>]*>/g, ''),
      });
      return { messageId, provider: 'resend' };
    } catch (err: any) {
      console.error(`[EmailSender] Resend failed for simple email: ${err.message}`);
      if (!params.smtpAccount) throw err;
      // Fall through to SMTP
    }
  }

  if (params.smtpAccount && params.smtpPassword) {
    const messageId = await sendViaSMTP({
      smtpAccount: params.smtpAccount,
      smtpPassword: params.smtpPassword,
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, ''),
      messageId: `<${crypto.randomUUID()}@skysend.io>`,
    });
    return { messageId, provider: 'smtp' };
  }

  throw new Error('No email transport available (Resend not configured, no SMTP account provided)');
}
