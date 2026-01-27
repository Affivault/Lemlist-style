import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { campaignsService } from '../services/campaigns.service.js';
import { campaignStepsService } from '../services/campaign-steps.service.js';
import { campaignContactsService } from '../services/campaign-contacts.service.js';

export const campaignsController = {
  // Campaign CRUD
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await campaignsService.list(req.userId!, req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.get(req.userId!, req.params.id);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.create(req.userId!, req.body);
      res.status(201).json(campaign);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.update(req.userId!, req.params.id, req.body);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignsService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  // Lifecycle
  async launch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.launch(req.userId!, req.params.id);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  async pause(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.pause(req.userId!, req.params.id);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  async resume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.resume(req.userId!, req.params.id);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.cancel(req.userId!, req.params.id);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  // Steps
  async getSteps(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const steps = await campaignStepsService.list(req.params.id);
      res.json(steps);
    } catch (err) { next(err); }
  },

  async addStep(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const step = await campaignStepsService.add(req.params.id, req.body);
      res.status(201).json(step);
    } catch (err) { next(err); }
  },

  async updateStep(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const step = await campaignStepsService.update(req.params.id, req.params.stepId, req.body);
      res.json(step);
    } catch (err) { next(err); }
  },

  async deleteStep(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignStepsService.delete(req.params.id, req.params.stepId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async reorderSteps(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignStepsService.reorder(req.params.id, req.body.step_ids);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  // Campaign contacts
  async getContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await campaignContactsService.list(req.params.id, req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  async addContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignContactsService.add(req.params.id, req.body.contact_ids);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async removeContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignContactsService.remove(req.params.id, req.body.contact_ids);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
