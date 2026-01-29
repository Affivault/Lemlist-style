import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { contactRoutes } from './contact.routes.js';
import { tagRoutes } from './tag.routes.js';
import { campaignRoutes } from './campaign.routes.js';
import { smtpRoutes } from './smtp.routes.js';
import { analyticsRoutes } from './analytics.routes.js';
import { inboxRoutes } from './inbox.routes.js';
import { sseRoutes } from './sse.routes.js';
import { saraRoutes } from './sara.routes.js';
import { assetRoutes } from './asset.routes.js';
import { verificationRoutes } from './verification.routes.js';
import { webhookRoutes } from './webhook.routes.js';
import { apikeyRoutes } from './apikey.routes.js';

export const routes = Router();

// All routes require authentication
routes.use(authMiddleware);

routes.use('/contacts', contactRoutes);
routes.use('/tags', tagRoutes);
routes.use('/campaigns', campaignRoutes);
routes.use('/smtp-accounts', smtpRoutes);
routes.use('/analytics', analyticsRoutes);
routes.use('/inbox', inboxRoutes);
routes.use('/sse', sseRoutes);
routes.use('/sara', saraRoutes);
routes.use('/assets', assetRoutes);
routes.use('/verification', verificationRoutes);
routes.use('/webhooks', webhookRoutes);
routes.use('/api-keys', apikeyRoutes);
