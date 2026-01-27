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

  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.markRead(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await inboxService.markAllRead(req.userId!);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
