import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { inboxService } from '../services/inbox.service.js';

export const inboxController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inboxService.list(req.userId!, req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await inboxService.get(req.userId!, req.params.id);
      res.json(message);
    } catch (err) { next(err); }
  },

  async getThread(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const thread = await inboxService.getThread(req.userId!, req.params.id);
      res.json(thread);
    } catch (err) { next(err); }
  },

  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.markRead(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async markUnread(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.markUnread(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.markAllRead(req.userId!);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async toggleStar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inboxService.toggleStar(req.userId!, req.params.id);
      res.json(result);
    } catch (err) { next(err); }
  },

  async archive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.archive(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async unarchive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.unarchive(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async reply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { body: replyBody } = req.body;
      if (!replyBody) return res.status(400).json({ error: 'Reply body is required' });
      const result = await inboxService.reply(req.userId!, req.params.id, replyBody);
      res.json(result);
    } catch (err) { next(err); }
  },

  async forward(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { to, note } = req.body;
      if (!to) return res.status(400).json({ error: 'Recipient email is required' });
      const result = await inboxService.forward(req.userId!, req.params.id, to, note);
      res.json(result);
    } catch (err) { next(err); }
  },

  async compose(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { to, subject, body: composeBody } = req.body;
      if (!to || !subject || !composeBody) return res.status(400).json({ error: 'To, subject, and body are required' });
      const result = await inboxService.compose(req.userId!, { to, subject, body: composeBody });
      res.json(result);
    } catch (err) { next(err); }
  },
};
