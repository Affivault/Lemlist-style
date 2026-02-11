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

      const { data: account } = await supabaseAdmin
        .from('smtp_accounts')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.userId!)
        .single();

      if (!account) return res.status(404).json({ error: 'SMTP account not found' });

      const password = decrypt(account.smtp_pass_encrypted);
      const transporter = nodemailer.createTransport({
        host: account.smtp_host,
        port: account.smtp_port,
        secure: account.smtp_secure,
        auth: { user: account.smtp_user, pass: password },
        connectionTimeout: 15000,
        socketTimeout: 30000,
      });

      const htmlBody = body_html || '<p>This is a test email from SkySend.</p>';
      await transporter.sendMail({
        from: account.email_address,
        to,
        subject: `[TEST] ${subject}`,
        html: htmlBody,
        text: htmlBody.replace(/<[^>]*>/g, ''),
      });

      console.log(`Test email sent to ${to} via ${account.label || account.smtp_host}`);
      res.json({ success: true, message: `Test email sent to ${to}` });
    } catch (err: any) {
      console.error('Test email error:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
