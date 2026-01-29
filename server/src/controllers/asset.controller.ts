import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as assetService from '../services/asset.service.js';

export const assetController = {
  // CRUD - requires auth
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await assetService.listTemplates(req.userId!);
      res.json(templates);
    } catch (err) { next(err); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await assetService.getTemplate(req.userId!, req.params.id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      res.json(template);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await assetService.createTemplate(req.userId!, req.body);
      res.status(201).json(template);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await assetService.updateTemplate(req.userId!, req.params.id, req.body);
      res.json(template);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await assetService.deleteTemplate(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async getPresets(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const presets = assetService.getPresetTemplates();
      res.json(presets);
    } catch (err) { next(err); }
  },

  async preview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await assetService.getTemplate(req.userId!, req.params.id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      const params = req.query as Record<string, string>;
      const svg = assetService.renderAssetSvg(template, params);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    } catch (err) { next(err); }
  },

  // Public render endpoint - no auth required (used in emails)
  async render(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const params = req.query as Record<string, string>;

      // Check cache first
      const cacheKey = assetService.getCacheKey(templateId, params);
      const cached = assetService.getCachedRender(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(cached);
        return;
      }

      // Fetch template without user context (public endpoint)
      const { supabaseAdmin } = await import('../config/supabase.js');
      const { data: template } = await supabaseAdmin
        .from('asset_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      const svg = assetService.renderAssetSvg(template, params);
      const buffer = Buffer.from(svg, 'utf-8');

      // Cache the result
      assetService.cacheRender(cacheKey, buffer);

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(svg);
    } catch (err) { next(err); }
  },
};
