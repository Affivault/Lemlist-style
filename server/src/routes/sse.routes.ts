import { Router } from 'express';
import { sseController } from '../controllers/sse.controller.js';

export const sseRoutes = Router();

// Health dashboard for all SMTP accounts
sseRoutes.get('/dashboard', sseController.dashboard);

// Select best sender for a campaign
sseRoutes.get('/campaigns/:campaignId/select', sseController.selectSender);

// Campaign SMTP pool management
sseRoutes.get('/campaigns/:campaignId/pool', sseController.getCampaignPool);
sseRoutes.put('/campaigns/:campaignId/pool', sseController.setCampaignPool);

// Event recording (typically called by email worker)
sseRoutes.post('/accounts/:accountId/send', sseController.recordSend);
sseRoutes.post('/accounts/:accountId/bounce', sseController.recordBounce);
sseRoutes.post('/accounts/:accountId/open', sseController.recordOpen);

// Maintenance (for cron jobs or manual triggers)
sseRoutes.post('/maintenance/reset-daily', sseController.resetDailyCounts);
sseRoutes.post('/maintenance/recalculate-bounces', sseController.recalculateBounceRates);
