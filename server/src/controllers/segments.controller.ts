import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { segmentsService } from '../services/segments.service.js';

export const segmentsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segments = await segmentsService.list(req.userId!);
      res.json(segments);
    } catch (err) { next(err); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segment = await segmentsService.get(req.userId!, req.params.id);
      res.json(segment);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segment = await segmentsService.create(req.userId!, req.body);
      res.status(201).json(segment);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segment = await segmentsService.update(req.userId!, req.params.id, req.body);
      res.json(segment);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await segmentsService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async refreshCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segment = await segmentsService.refreshCount(req.userId!, req.params.id);
      res.json(segment);
    } catch (err) { next(err); }
  },

  async preview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await segmentsService.countMatchingContacts(req.userId!, req.body.filter_config);
      res.json({ count });
    } catch (err) { next(err); }
  },

  async getContactIds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segment = await segmentsService.get(req.userId!, req.params.id);
      const contactIds = await segmentsService.getMatchingContactIds(req.userId!, segment.filter_config);
      res.json({ contact_ids: contactIds });
    } catch (err) { next(err); }
  },
};
