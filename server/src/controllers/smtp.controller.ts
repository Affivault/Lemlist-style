import { Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { smtpService } from '../services/smtp.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { decrypt } from '../utils/encryption.js';

export const smtpController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const accounts = await smtpService.list(req.userId!);
      res.json(accounts);
    } catch (err) { next(err); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await smtpService.get(req.userId!, req.params.id);
      res.json(account);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await smtpService.create(req.userId!, req.body);
      res.status(201).json(account);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await smtpService.update(req.userId!, req.params.id, req.body);
      res.json(account);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await smtpService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async test(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await smtpService.test(req.userId!, req.params.id);
      res.json(result);
    } catch (err) { next(err); }
  },

  /**
   * POST /smtp-accounts/:id/send-test
   * Send a test email through a specific SMTP account (no campaign needed).
   */
  async sendTestEmail(req: AuthRequest, res: Response, _next: NextFunction) {
    try {
      const { to, subject, body_html } = req.body;
      if (!to || !subject) {
        return res.status(400).json({ error: 'to and subject are required' });
      }

      console.log(`[TestEmail] Request: to=${to}, subject=${subject}, smtpId=${req.params.id}, userId=${req.userId}`);

      const { data: account, error: fetchError } = await supabaseAdmin
        .from('smtp_accounts')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.userId!)
        .single();

      if (fetchError) {
        console.error('[TestEmail] DB fetch error:', fetchError.message);
        return res.status(500).json({ error: `Database error: ${fetchError.message}` });
      }
      if (!account) {
        return res.status(404).json({ error: 'SMTP account not found for this user' });
      }

      console.log(`[TestEmail] Using SMTP: ${account.smtp_host}:${account.smtp_port} user=${account.smtp_user}`);

      let password: string;
      try {
        password = decrypt(account.smtp_pass_encrypted);
      } catch (decryptErr: any) {
        console.error('[TestEmail] Decrypt error:', decryptErr.message);
        return res.status(500).json({ error: `Failed to decrypt SMTP password: ${decryptErr.message}` });
      }

      const transporter = nodemailer.createTransport({
        host: account.smtp_host,
        port: account.smtp_port,
        secure: account.smtp_secure,
        auth: { user: account.smtp_user, pass: password },
        connectionTimeout: 15000,
        socketTimeout: 30000,
      });

      // Verify SMTP connection first
      try {
        await transporter.verify();
        console.log('[TestEmail] SMTP connection verified');
      } catch (verifyErr: any) {
        console.error('[TestEmail] SMTP verify failed:', verifyErr.message);
        return res.status(500).json({
          success: false,
          error: `SMTP connection failed: ${verifyErr.message}. Check your host, port, username, and password.`,
        });
      }

      const htmlBody = body_html || '<p>This is a test email from SkySend.</p>';
      await transporter.sendMail({
        from: account.email_address,
        to,
        subject: `[TEST] ${subject}`,
        html: htmlBody,
        text: htmlBody.replace(/<[^>]*>/g, ''),
      });

      // Mark account as verified since we know the credentials work
      await supabaseAdmin
        .from('smtp_accounts')
        .update({ is_verified: true })
        .eq('id', account.id);

      console.log(`[TestEmail] Sent to ${to} via ${account.label || account.smtp_host}`);
      res.json({ success: true, message: `Test email sent to ${to}` });
    } catch (err: any) {
      console.error('[TestEmail] Send error:', err.message);
      res.status(500).json({ success: false, error: `Send failed: ${err.message}` });
    }
  },
};
