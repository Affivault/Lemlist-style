import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { sendingSchedulesService } from '../services/sending-schedules.service.js';

const dayEnum = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;

const createSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().optional(),
  send_window_start: z.string().regex(timeRegex).optional(),
  send_window_end: z.string().regex(timeRegex).optional(),
  send_days: z.array(dayEnum).optional(),
  is_default: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

export const sendingSchedulesController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await sendingSchedulesService.list(req.userId!);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getDefault(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await sendingSchedulesService.getDefault(req.userId!);
      res.json(data || null);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = createSchema.parse(req.body);
      const data = await sendingSchedulesService.create(req.userId!, input);
      res.status(201).json(data);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = updateSchema.parse(req.body);
      const data = await sendingSchedulesService.update(req.userId!, req.params.id, input);
      res.json(data);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await sendingSchedulesService.delete(req.userId!, req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  },
};
