import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { settingsService } from '../services/settings.service.js';
import { supabaseAdmin } from '../config/supabase.js';

export const settingsController = {
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.get(req.userId!);
      res.json(settings);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.update(req.userId!, req.body);
      res.json(settings);
    } catch (err) { next(err); }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { new_password } = req.body;
      if (!new_password || new_password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(req.userId!, {
        password: new_password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) { next(err); }
  },

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { confirmation } = req.body;
      if (confirmation !== 'DELETE') {
        return res.status(400).json({ error: 'Please type DELETE to confirm account deletion' });
      }

      await settingsService.deleteAccount(req.userId!);
      res.json({ success: true, message: 'Account deleted' });
    } catch (err) { next(err); }
  },
};
