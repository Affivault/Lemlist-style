import { Router } from 'express';
import { campaignFoldersController } from '../controllers/campaign-folders.controller.js';

export const campaignFoldersRoutes = Router();

campaignFoldersRoutes.get('/',                  campaignFoldersController.list);
campaignFoldersRoutes.post('/',                 campaignFoldersController.create);
campaignFoldersRoutes.patch('/:id',             campaignFoldersController.update);
campaignFoldersRoutes.delete('/:id',            campaignFoldersController.delete);
campaignFoldersRoutes.post('/move',             campaignFoldersController.moveCampaign);
campaignFoldersRoutes.get('/:id/analytics',     campaignFoldersController.folderAnalytics);
