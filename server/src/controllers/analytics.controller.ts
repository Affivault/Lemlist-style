import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { analyticsService } from '../services/analytics.service.js';

export const analyticsController = {
  async overview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.overview(req.userId!);
      res.json(data);
    } catch (err) { next(err); }
  },

  async campaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.campaign(req.userId!, req.params.campaignId);
      res.json(data);
    } catch (err) { next(err); }
  },

  async campaignContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.campaignContacts(req.userId!, req.params.campaignId);
      res.json(data);
    } catch (err) { next(err); }
  },

  async contactTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.contactTimeline(req.userId!, req.params.contactId);
      res.json(data);
    } catch (err) { next(err); }
  },
};
