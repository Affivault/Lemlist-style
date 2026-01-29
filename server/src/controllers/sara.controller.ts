import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as saraService from '../services/sara.service.js';

export const saraController = {
  async getQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        intent: req.query.intent as string | undefined,
        status: req.query.status as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };
      const result = await saraService.getQueue(req.userId!, filters);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await saraService.getQueueStats(req.userId!);
      res.json(stats);
    } catch (err) { next(err); }
  },

  async classify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const result = await saraService.processReply(messageId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const { edited_reply } = req.body;
      await saraService.approveReply(messageId, req.userId!, edited_reply);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async dismiss(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      await saraService.dismissReply(messageId, req.userId!);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
