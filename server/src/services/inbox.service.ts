import crypto from 'node:crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';
import { decrypt } from '../utils/encryption.js';
import { sendViaSmtp } from './email-sender.service.js';

export const inboxService = {
  async list(userId: string, params: {
    page?: number;
    limit?: number;
    is_read?: boolean;
    is_starred?: boolean;
    is_archived?: boolean;
    sara_status?: string;
    sara_intent?: string;
    search?: string;
    folder?: string;
  }) {
    const { page, limit, from, to } = getPagination(params);

    let query = supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name, email), campaigns(name), smtp_accounts(id, email_address, label)', { count: 'exact' })
      .eq('user_id', userId);

    // Folder-based filtering
    const folder = params.folder || 'inbox';
    if (folder === 'inbox') {
      query = query.or('is_archived.is.null,is_archived.eq.false');
    } else if (folder === 'starred') {
      query = query.eq('is_starred', true);
    } else if (folder === 'archived') {
      query = query.eq('is_archived', true);
    } else if (folder === 'sent') {
      query = query.eq('direction', 'outbound');
    }

    if (params.is_read !== undefined) {
      query = query.eq('is_read', params.is_read);
    }

    if (params.is_starred !== undefined) {
      query = query.eq('is_starred', params.is_starred);
    }

    if (params.sara_status) {
      query = query.eq('sara_status', params.sara_status);
    }

    if (params.sara_intent) {
      query = query.eq('sara_intent', params.sara_intent);
    }

    if (params.search) {
      query = query.or(
        `subject.ilike.%${params.search}%,from_email.ilike.%${params.search}%,body_text.ilike.%${params.search}%`
      );
    }

    query = query.order('received_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw new AppError(error.message, 500);

    const messages = (data || []).map((m: any) => ({
      ...m,
      contact_name: m.contacts
        ? [m.contacts.first_name, m.contacts.last_name].filter(Boolean).join(' ') || null
        : null,
      contact_email: m.contacts?.email || null,
      campaign_name: m.campaigns?.name || null,
      smtp_email: m.smtp_accounts?.email_address || null,
      smtp_label: m.smtp_accounts?.label || null,
      contacts: undefined,
      campaigns: undefined,
      smtp_accounts: undefined,
    }));

    return formatPaginatedResponse(messages, count || 0, page, limit);
  },

  async get(userId: string, id: string) {
    const { data, error } = await supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name, email), campaigns(name), smtp_accounts(id, email_address, label)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Message not found', 404);

    return {
      ...data,
      contact_name: data.contacts
        ? [data.contacts.first_name, data.contacts.last_name].filter(Boolean).join(' ') || null
        : null,
      contact_email: data.contacts?.email || null,
      campaign_name: data.campaigns?.name || null,
      smtp_email: data.smtp_accounts?.email_address || null,
      smtp_label: data.smtp_accounts?.label || null,
      contacts: undefined,
      campaigns: undefined,
      smtp_accounts: undefined,
    };
  },

  async getThread(userId: string, messageId: string) {
    // Step 1: Fetch the message to get contact info
    const { data: message } = await supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name, email)')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();

    if (!message) throw new AppError('Message not found', 404);

    // Step 2: Determine the contact email to find ALL conversations
    const contactEmail = message.contacts?.email ||
      (message.direction === 'outbound' ? message.to_email : message.from_email);

    if (!contactEmail) {
      // Fallback: return just this message
      return [{
        ...message,
        contact_name: message.contacts
          ? [message.contacts.first_name, message.contacts.last_name].filter(Boolean).join(' ') || null
          : null,
        contact_email: message.contacts?.email || null,
        contacts: undefined,
      }];
    }

    // Step 3: Find ALL messages with this contact (both directions)
    const { data, error } = await supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name, email), smtp_accounts(id, email_address, label)')
      .eq('user_id', userId)
      .or(`from_email.eq.${contactEmail},to_email.eq.${contactEmail}`)
      .order('received_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    return (data || []).map((m: any) => ({
      ...m,
      contact_name: m.contacts
        ? [m.contacts.first_name, m.contacts.last_name].filter(Boolean).join(' ') || null
        : null,
      contact_email: m.contacts?.email || null,
      smtp_email: m.smtp_accounts?.email_address || null,
      smtp_label: m.smtp_accounts?.label || null,
      contacts: undefined,
      smtp_accounts: undefined,
    }));
  },

  async markRead(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new AppError(error.message, 500);
  },

  async markUnread(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_read: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new AppError(error.message, 500);
  },

  async markAllRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw new AppError(error.message, 500);
  },

  async toggleStar(userId: string, id: string) {
    const { data: msg } = await supabaseAdmin
      .from('inbox_messages')
      .select('is_starred')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (!msg) throw new AppError('Message not found', 404);

    const newVal = !msg.is_starred;
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_starred: newVal })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new AppError(error.message, 500);
    return { is_starred: newVal };
  },

  async archive(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_archived: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new AppError(error.message, 500);
  },

  async unarchive(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_archived: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new AppError(error.message, 500);
  },

  async reply(userId: string, messageId: string, body: string, smtpAccountId?: string, bodyHtml?: string) {
    const { data: original } = await supabaseAdmin
      .from('inbox_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();
    if (!original) throw new AppError('Message not found', 404);

    const smtpAccount = await findSmtpAccount(userId, smtpAccountId || original.smtp_account_id);
    const smtpPassword = decrypt(smtpAccount.smtp_pass_encrypted);
    const domain = smtpAccount.email_address?.split('@')[1] || 'skysend.io';
    const newMessageId = `<${crypto.randomUUID()}@${domain}>`;

    const subject = original.subject?.startsWith('Re:')
      ? original.subject
      : `Re: ${original.subject || '(no subject)'}`;

    // Use rich HTML from editor if provided, otherwise convert plain text
    const userHtml = bodyHtml || `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${body.replace(/\n/g, '<br/>')}</div>`;
    const htmlBody = `${userHtml}
<br/>
<div style="padding-left:12px;border-left:2px solid #e0e0e0;margin-top:16px;color:#666;">
  <p style="margin:0 0 4px;font-size:12px;color:#999;">On ${new Date(original.received_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}, ${original.from_email} wrote:</p>
  ${original.body_html || `<p>${original.body_text || ''}</p>`}
</div>`;

    await sendViaSmtp({
      smtpHost: smtpAccount.smtp_host,
      smtpPort: smtpAccount.smtp_port,
      smtpSecure: smtpAccount.smtp_secure,
      smtpUser: smtpAccount.smtp_user,
      smtpPass: smtpPassword,
      from: smtpAccount.email_address,
      to: original.from_email,
      subject,
      html: htmlBody,
      text: body,
      messageId: newMessageId,
      headers: original.message_id ? { 'In-Reply-To': original.message_id, 'References': original.message_id } : {},
    });

    await supabaseAdmin.from('inbox_messages').insert({
      user_id: userId,
      campaign_id: original.campaign_id,
      contact_id: original.contact_id,
      smtp_account_id: smtpAccount.id,
      from_email: smtpAccount.email_address,
      to_email: original.from_email,
      subject,
      body_html: htmlBody,
      body_text: body,
      in_reply_to: original.message_id,
      message_id: newMessageId,
      is_read: true,
      direction: 'outbound',
      thread_id: original.thread_id || original.message_id,
      received_at: new Date().toISOString(),
    });

    return { success: true, message_id: newMessageId };
  },

  async forward(userId: string, messageId: string, toEmail: string, note?: string, smtpAccountId?: string, noteHtmlRaw?: string) {
    const { data: original } = await supabaseAdmin
      .from('inbox_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();
    if (!original) throw new AppError('Message not found', 404);

    const smtpAccount = await findSmtpAccount(userId, smtpAccountId || original.smtp_account_id);
    const smtpPassword = decrypt(smtpAccount.smtp_pass_encrypted);
    const domain = smtpAccount.email_address?.split('@')[1] || 'skysend.io';
    const newMessageId = `<${crypto.randomUUID()}@${domain}>`;
    const subject = `Fwd: ${(original.subject || '(no subject)').replace(/^Fwd:\s*/i, '')}`;

    // Use rich HTML from editor if provided, otherwise convert plain text
    const noteHtml = noteHtmlRaw
      ? `${noteHtmlRaw}<hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;"/>`
      : note
        ? `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;margin-bottom:16px;">${note.replace(/\n/g, '<br/>')}</div><hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;"/>`
        : '';

    const htmlBody = `${noteHtml}
<p style="margin:0 0 8px;font-size:12px;color:#999;">---------- Forwarded message ----------</p>
<p style="margin:0 0 4px;font-size:12px;color:#999;">From: ${original.from_email}<br/>Date: ${new Date(original.received_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>Subject: ${original.subject || '(no subject)'}<br/>To: ${original.to_email}</p>
<br/>
${original.body_html || `<p>${original.body_text || ''}</p>`}`;

    await sendViaSmtp({
      smtpHost: smtpAccount.smtp_host,
      smtpPort: smtpAccount.smtp_port,
      smtpSecure: smtpAccount.smtp_secure,
      smtpUser: smtpAccount.smtp_user,
      smtpPass: smtpPassword,
      from: smtpAccount.email_address,
      to: toEmail,
      subject,
      html: htmlBody,
      text: `${note || ''}\n\n---------- Forwarded message ----------\nFrom: ${original.from_email}\nDate: ${original.received_at}\nSubject: ${original.subject}\n\n${original.body_text || ''}`,
      messageId: newMessageId,
    });

    await supabaseAdmin.from('inbox_messages').insert({
      user_id: userId,
      smtp_account_id: smtpAccount.id,
      from_email: smtpAccount.email_address,
      to_email: toEmail,
      subject,
      body_html: htmlBody,
      body_text: `${note || ''}\n\n${original.body_text || ''}`,
      message_id: newMessageId,
      is_read: true,
      direction: 'outbound',
      received_at: new Date().toISOString(),
    });

    return { success: true, message_id: newMessageId };
  },

  async compose(userId: string, input: { to: string; subject: string; body: string; body_html?: string; smtp_account_id?: string }) {
    const smtpAccount = await findSmtpAccount(userId, input.smtp_account_id);

    const smtpPassword = decrypt(smtpAccount.smtp_pass_encrypted);
    const domain = smtpAccount.email_address?.split('@')[1] || 'skysend.io';
    const messageId = `<${crypto.randomUUID()}@${domain}>`;
    // Use rich HTML from editor if provided, otherwise convert plain text
    const htmlBody = input.body_html || `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${input.body.replace(/\n/g, '<br/>')}</div>`;

    await sendViaSmtp({
      smtpHost: smtpAccount.smtp_host,
      smtpPort: smtpAccount.smtp_port,
      smtpSecure: smtpAccount.smtp_secure,
      smtpUser: smtpAccount.smtp_user,
      smtpPass: smtpPassword,
      from: smtpAccount.email_address,
      to: input.to,
      subject: input.subject,
      html: htmlBody,
      text: input.body,
      messageId,
    });

    await supabaseAdmin.from('inbox_messages').insert({
      user_id: userId,
      smtp_account_id: smtpAccount.id,
      from_email: smtpAccount.email_address,
      to_email: input.to,
      subject: input.subject,
      body_html: htmlBody,
      body_text: input.body,
      message_id: messageId,
      is_read: true,
      direction: 'outbound',
      received_at: new Date().toISOString(),
    });

    return { success: true, message_id: messageId };
  },

  /**
   * Schedule a new compose email for future sending.
   * Stores the message in inbox_messages with a scheduled_at timestamp instead of sending immediately.
   */
  async scheduleSend(userId: string, input: { to: string; subject: string; body: string; body_html?: string; smtp_account_id?: string; scheduled_at: string }) {
    const smtpAccount = await findSmtpAccount(userId, input.smtp_account_id);

    const domain = smtpAccount.email_address?.split('@')[1] || 'skysend.io';
    const messageId = `<${crypto.randomUUID()}@${domain}>`;
    const htmlBody = input.body_html || `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${input.body.replace(/\n/g, '<br/>')}</div>`;

    const { data, error } = await supabaseAdmin.from('inbox_messages').insert({
      user_id: userId,
      smtp_account_id: smtpAccount.id,
      from_email: smtpAccount.email_address,
      to_email: input.to,
      subject: input.subject,
      body_html: htmlBody,
      body_text: input.body,
      message_id: messageId,
      is_read: true,
      direction: 'outbound',
      received_at: new Date().toISOString(),
      scheduled_at: input.scheduled_at,
    }).select('id').single();

    if (error) throw new AppError(error.message, 500);
    return { success: true, message_id: messageId, id: data?.id, scheduled_at: input.scheduled_at };
  },

  /**
   * Schedule a reply email for future sending.
   * Stores the reply in inbox_messages with a scheduled_at timestamp instead of sending immediately.
   */
  async scheduleReply(userId: string, messageId: string, body: string, scheduledAt: string, smtpAccountId?: string, bodyHtml?: string) {
    const { data: original } = await supabaseAdmin
      .from('inbox_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();
    if (!original) throw new AppError('Message not found', 404);

    const smtpAccount = await findSmtpAccount(userId, smtpAccountId || original.smtp_account_id);
    const domain = smtpAccount.email_address?.split('@')[1] || 'skysend.io';
    const newMessageId = `<${crypto.randomUUID()}@${domain}>`;

    const subject = original.subject?.startsWith('Re:')
      ? original.subject
      : `Re: ${original.subject || '(no subject)'}`;

    const userHtml = bodyHtml || `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${body.replace(/\n/g, '<br/>')}</div>`;
    const htmlBody = `${userHtml}
<br/>
<div style="padding-left:12px;border-left:2px solid #e0e0e0;margin-top:16px;color:#666;">
  <p style="margin:0 0 4px;font-size:12px;color:#999;">On ${new Date(original.received_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}, ${original.from_email} wrote:</p>
  ${original.body_html || `<p>${original.body_text || ''}</p>`}
</div>`;

    const { data, error } = await supabaseAdmin.from('inbox_messages').insert({
      user_id: userId,
      campaign_id: original.campaign_id,
      contact_id: original.contact_id,
      smtp_account_id: smtpAccount.id,
      from_email: smtpAccount.email_address,
      to_email: original.from_email,
      subject,
      body_html: htmlBody,
      body_text: body,
      in_reply_to: original.message_id,
      message_id: newMessageId,
      is_read: true,
      direction: 'outbound',
      thread_id: original.thread_id || original.message_id,
      received_at: new Date().toISOString(),
      scheduled_at: scheduledAt,
    }).select('id').single();

    if (error) throw new AppError(error.message, 500);
    return { success: true, message_id: newMessageId, id: data?.id, scheduled_at: scheduledAt };
  },

  /**
   * Cancel a scheduled email by clearing its scheduled_at timestamp.
   */
  async cancelScheduledEmail(userId: string, id: string) {
    // Verify the message exists, belongs to the user, and is actually scheduled
    const { data: msg } = await supabaseAdmin
      .from('inbox_messages')
      .select('id, scheduled_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!msg) throw new AppError('Message not found', 404);
    if (!msg.scheduled_at) throw new AppError('Message is not scheduled', 400);

    // Delete the unsent message entirely
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(error.message, 500);
    return { success: true };
  },

  /**
   * List all pending scheduled emails for a user.
   */
  async listScheduledEmails(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('inbox_messages')
      .select('*, smtp_accounts(id, email_address, label)')
      .eq('user_id', userId)
      .eq('direction', 'outbound')
      .not('scheduled_at', 'is', null)
      .order('scheduled_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    return (data || []).map((m: any) => ({
      ...m,
      smtp_email: m.smtp_accounts?.email_address || null,
      smtp_label: m.smtp_accounts?.label || null,
      smtp_accounts: undefined,
    }));
  },

  /**
   * Generate an AI-assisted reply draft based on the original message and user prompt.
   */
  async generateReplyAssist(userId: string, messageId: string, prompt: string): Promise<{ html: string; text: string }> {
    const { data: msg } = await supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name, company, email)')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();
    if (!msg) throw new AppError('Message not found', 404);

    const senderName = msg.contacts
      ? [msg.contacts.first_name, msg.contacts.last_name].filter(Boolean).join(' ')
      : msg.from_email?.split('@')[0] || 'there';
    const firstName = msg.contacts?.first_name || senderName.split(' ')[0] || 'there';
    const originalBody = msg.body_text || '';
    const subject = msg.subject || '';
    const promptLower = prompt.toLowerCase();

    // Context-aware reply generation based on user prompt
    let replyText: string;

    if (/accept|agree|yes|confirm|sounds good|let'?s do/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nThanks for reaching out! That sounds great — I'd be happy to move forward.\n\nPlease let me know if there are any next steps on your end, or if you'd like to schedule a time to connect.\n\nBest regards`;
    } else if (/meet|call|schedule|book|calendar|chat|demo/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nI'd love to set up a time to chat! I'm generally available this week — feel free to suggest a time that works best for you, or I can send over some options.\n\nLooking forward to connecting.\n\nBest regards`;
    } else if (/decline|no|not interested|pass|reject/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nThank you for thinking of us. After careful consideration, I'm going to pass on this for now.\n\nI appreciate you reaching out and wish you all the best.\n\nKind regards`;
    } else if (/more info|details|learn more|tell me|explain/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nThanks for your interest! I'd be happy to share more details.\n\nCould you let me know which specific aspects you'd like to learn more about? That way I can tailor the information to what's most relevant for you.\n\nBest regards`;
    } else if (/follow.?up|check.?in|touch base|reconnect/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nJust wanted to follow up on my previous message and see if you had any thoughts.\n\nI'd love to hear back from you when you get a chance. No rush at all — just wanted to make sure this didn't slip through the cracks.\n\nBest regards`;
    } else if (/thank|appreciate|grateful/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nThank you so much — I really appreciate it!\n\nPlease don't hesitate to reach out if there's anything else I can help with.\n\nBest regards`;
    } else if (/delay|later|postpone|busy|not now/i.test(promptLower)) {
      replyText = `Hi ${firstName},\n\nNo worries at all — I completely understand. Timing is everything.\n\nFeel free to reach out whenever you're ready, and I'll be happy to pick things back up.\n\nBest regards`;
    } else {
      // Generic professional reply incorporating the user's prompt
      replyText = `Hi ${firstName},\n\n${prompt}\n\nPlease let me know if you have any questions.\n\nBest regards`;
    }

    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${replyText.replace(/\n/g, '<br/>')}</div>`;

    return { html, text: replyText };
  },
};

async function findSmtpAccount(userId: string, preferredId?: string | null): Promise<any> {
  if (preferredId) {
    const { data } = await supabaseAdmin
      .from('smtp_accounts')
      .select('*')
      .eq('id', preferredId)
      .eq('user_id', userId)
      .single();
    if (data) return data;
  }
  const { data } = await supabaseAdmin
    .from('smtp_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .single();
  if (!data) throw new AppError('No SMTP account available. Add one in SMTP Accounts settings.', 400);
  return data;
}

/**
 * Process all scheduled emails that are due for sending.
 * Called by the sequence worker on each tick (every 30 seconds).
 *
 * Queries inbox_messages where scheduled_at <= now and scheduled_at IS NOT NULL,
 * sends each one via SMTP, then clears scheduled_at to mark as sent.
 * On error, clears scheduled_at to prevent infinite retry loops.
 */
export async function processScheduledEmails(): Promise<number> {
  const now = new Date().toISOString();

  const { data: dueMessages, error } = await supabaseAdmin
    .from('inbox_messages')
    .select('*, smtp_accounts(id, email_address, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_encrypted, user_id)')
    .eq('direction', 'outbound')
    .not('scheduled_at', 'is', null)
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[ScheduledEmails] Query error:', error.message);
    return 0;
  }

  if (!dueMessages || dueMessages.length === 0) return 0;

  let sent = 0;

  for (const msg of dueMessages) {
    try {
      const smtpAccount = msg.smtp_accounts;
      if (!smtpAccount) {
        console.error(`[ScheduledEmails] No SMTP account for message ${msg.id}, clearing schedule`);
        await supabaseAdmin
          .from('inbox_messages')
          .update({ scheduled_at: null })
          .eq('id', msg.id);
        continue;
      }

      const smtpPassword = decrypt(smtpAccount.smtp_pass_encrypted);

      await sendViaSmtp({
        smtpHost: smtpAccount.smtp_host,
        smtpPort: smtpAccount.smtp_port,
        smtpSecure: smtpAccount.smtp_secure,
        smtpUser: smtpAccount.smtp_user,
        smtpPass: smtpPassword,
        from: smtpAccount.email_address,
        to: msg.to_email,
        subject: msg.subject,
        html: msg.body_html,
        text: msg.body_text,
        messageId: msg.message_id,
        headers: msg.in_reply_to ? { 'In-Reply-To': msg.in_reply_to, 'References': msg.in_reply_to } : {},
      });

      // Mark as sent by clearing scheduled_at
      await supabaseAdmin
        .from('inbox_messages')
        .update({ scheduled_at: null })
        .eq('id', msg.id);

      sent++;
      console.log(`[ScheduledEmails] Sent scheduled email ${msg.id} to ${msg.to_email}`);
    } catch (err: any) {
      console.error(`[ScheduledEmails] Failed to send message ${msg.id}:`, err.message);
      // Clear scheduled_at to prevent infinite retry loop (per MEMORY.md pattern)
      await supabaseAdmin
        .from('inbox_messages')
        .update({ scheduled_at: null })
        .eq('id', msg.id);
    }
  }

  return sent;
}
