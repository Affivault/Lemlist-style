import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { contactRoutes } from './contact.routes.js';
import { tagRoutes } from './tag.routes.js';
import { campaignRoutes } from './campaign.routes.js';
import { smtpRoutes } from './smtp.routes.js';
import { analyticsRoutes } from './analytics.routes.js';
import { inboxRoutes } from './inbox.routes.js';

export const routes = Router();

// All routes require authentication
routes.use(authMiddleware);

routes.use('/contacts', contactRoutes);
routes.use('/tags', tagRoutes);
routes.use('/campaigns', campaignRoutes);
routes.use('/smtp-accounts', smtpRoutes);
routes.use('/analytics', analyticsRoutes);
routes.use('/inbox', inboxRoutes);
