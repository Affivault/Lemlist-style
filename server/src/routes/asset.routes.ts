import { Router } from 'express';
import { assetController } from '../controllers/asset.controller.js';

export const assetRoutes = Router();

// Template CRUD (auth required - mounted under /api/v1)
assetRoutes.get('/templates', assetController.list);
assetRoutes.get('/templates/presets', assetController.getPresets);
assetRoutes.get('/templates/:id', assetController.get);
assetRoutes.post('/templates', assetController.create);
assetRoutes.put('/templates/:id', assetController.update);
assetRoutes.delete('/templates/:id', assetController.delete);

// Preview (auth required)
assetRoutes.get('/templates/:id/preview', assetController.preview);
