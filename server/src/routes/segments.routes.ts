import { Router } from 'express';
import { segmentsController } from '../controllers/segments.controller.js';

export const segmentsRoutes = Router();

segmentsRoutes.get('/', segmentsController.list);
segmentsRoutes.get('/:id', segmentsController.get);
segmentsRoutes.post('/', segmentsController.create);
segmentsRoutes.put('/:id', segmentsController.update);
segmentsRoutes.delete('/:id', segmentsController.delete);

// Get contact IDs matching segment
segmentsRoutes.get('/:id/contacts', segmentsController.getContactIds);

// Refresh cached count
segmentsRoutes.post('/:id/refresh', segmentsController.refreshCount);

// Preview count for filter config (without saving)
segmentsRoutes.post('/preview', segmentsController.preview);
