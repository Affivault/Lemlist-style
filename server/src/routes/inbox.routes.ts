import { Router } from 'express';
import { inboxController } from '../controllers/inbox.controller.js';

export const inboxRoutes = Router();

inboxRoutes.get('/', inboxController.list);
inboxRoutes.get('/:id', inboxController.get);
inboxRoutes.put('/mark-all-read', inboxController.markAllRead);
inboxRoutes.put('/:id/read', inboxController.markRead);
