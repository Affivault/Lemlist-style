import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';

export const settingsRoutes = Router();

settingsRoutes.get('/', settingsController.get);
settingsRoutes.put('/', settingsController.update);
settingsRoutes.post('/change-password', settingsController.changePassword);
settingsRoutes.post('/delete-account', settingsController.deleteAccount);
