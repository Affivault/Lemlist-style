import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { tagsService } from '../services/tags.service.js';

export const tagsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tags = await tagsService.list(req.userId!);
      res.json(tags);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tag = await tagsService.create(req.userId!, req.body);
      res.status(201).json(tag);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tag = await tagsService.update(req.userId!, req.params.id, req.body);
      res.json(tag);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await tagsService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
