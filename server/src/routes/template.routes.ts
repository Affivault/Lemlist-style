import { Router } from 'express';
import { templateController } from '../controllers/template.controller.js';

export const templateRoutes = Router();

// Email templates
templateRoutes.get('/emails', templateController.listEmails);
templateRoutes.get('/emails/:id', templateController.getEmail);
templateRoutes.post('/emails', templateController.createEmail);
templateRoutes.put('/emails/:id', templateController.updateEmail);
templateRoutes.delete('/emails/:id', templateController.deleteEmail);
templateRoutes.post('/emails/:id/duplicate', templateController.duplicateEmail);

// Sequence templates
templateRoutes.get('/sequences', templateController.listSequences);
templateRoutes.get('/sequences/:id', templateController.getSequence);
templateRoutes.post('/sequences', templateController.createSequence);
templateRoutes.put('/sequences/:id', templateController.updateSequence);
templateRoutes.delete('/sequences/:id', templateController.deleteSequence);
templateRoutes.post('/sequences/:id/duplicate', templateController.duplicateSequence);

// Presets
templateRoutes.get('/presets', templateController.getPresets);
