import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { listsService } from '../services/lists.service.js';

export const listsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lists = await listsService.list(req.userId!);
      res.json(lists);
    } catch (err) { next(err); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const list = await listsService.get(req.userId!, req.params.id);
      res.json(list);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const list = await listsService.create(req.userId!, req.body);
      res.status(201).json(list);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const list = await listsService.update(req.userId!, req.params.id, req.body);
      res.json(list);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await listsService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async addContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await listsService.addContacts(req.userId!, req.params.id, req.body.contact_ids);
      res.json(result);
    } catch (err) { next(err); }
  },

  async removeContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await listsService.removeContacts(req.userId!, req.params.id, req.body.contact_ids);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const contactIds = await listsService.getContactsInList(req.userId!, req.params.id);
      res.json({ contact_ids: contactIds });
    } catch (err) { next(err); }
  },
};
