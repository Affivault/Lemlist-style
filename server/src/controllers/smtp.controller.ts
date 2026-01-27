import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { smtpService } from '../services/smtp.service.js';

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
};
