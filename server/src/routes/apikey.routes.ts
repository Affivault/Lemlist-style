import { Router } from 'express';
import { apikeyController } from '../controllers/apikey.controller.js';

export const apikeyRoutes = Router();

apikeyRoutes.get('/', apikeyController.list);
apikeyRoutes.post('/', apikeyController.create);
apikeyRoutes.post('/:id/revoke', apikeyController.revoke);
apikeyRoutes.delete('/:id', apikeyController.delete);
