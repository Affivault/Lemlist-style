import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { templateService } from '../services/template.service.js';

export const templateController = {
  // Email Templates
  async listEmails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.listEmailTemplates(req.userId!);
      res.json(templates);
    } catch (err) { next(err); }
  },

  async getEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.getEmailTemplate(req.userId!, req.params.id);
      res.json(template);
    } catch (err) { next(err); }
  },

  async createEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.createEmailTemplate(req.userId!, req.body);
      res.status(201).json(template);
    } catch (err) { next(err); }
  },

  async updateEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.updateEmailTemplate(req.userId!, req.params.id, req.body);
      res.json(template);
    } catch (err) { next(err); }
  },

  async deleteEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await templateService.deleteEmailTemplate(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async duplicateEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.duplicateEmailTemplate(req.userId!, req.params.id);
      res.status(201).json(template);
    } catch (err) { next(err); }
  },

  // Sequence Templates
  async listSequences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.listSequenceTemplates(req.userId!);
      res.json(templates);
    } catch (err) { next(err); }
  },

  async getSequence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.getSequenceTemplate(req.userId!, req.params.id);
      res.json(template);
    } catch (err) { next(err); }
  },

  async createSequence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.createSequenceTemplate(req.userId!, req.body);
      res.status(201).json(template);
    } catch (err) { next(err); }
  },

  async updateSequence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.updateSequenceTemplate(req.userId!, req.params.id, req.body);
      res.json(template);
    } catch (err) { next(err); }
  },

  async deleteSequence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await templateService.deleteSequenceTemplate(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async duplicateSequence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.duplicateSequenceTemplate(req.userId!, req.params.id);
      res.status(201).json(template);
    } catch (err) { next(err); }
  },

  // Presets
  async getPresets(_req: AuthRequest, res: Response, _next: NextFunction) {
    res.json({
      emails: templateService.getPresetEmailTemplates(),
      sequences: templateService.getPresetSequenceTemplates(),
    });
  },
};
