import { Router } from 'express';
import { inboxController } from '../controllers/inbox.controller.js';

export const inboxRoutes = Router();

inboxRoutes.get('/', inboxController.list);
inboxRoutes.get('/:id', inboxController.get);
inboxRoutes.get('/:id/thread', inboxController.getThread);
inboxRoutes.put('/mark-all-read', inboxController.markAllRead);
inboxRoutes.put('/:id/read', inboxController.markRead);
inboxRoutes.put('/:id/unread', inboxController.markUnread);
inboxRoutes.put('/:id/star', inboxController.toggleStar);
inboxRoutes.put('/:id/archive', inboxController.archive);
inboxRoutes.put('/:id/unarchive', inboxController.unarchive);
inboxRoutes.post('/:id/reply', inboxController.reply);
inboxRoutes.post('/:id/forward', inboxController.forward);
inboxRoutes.post('/:id/ai-reply-assist', inboxController.aiReplyAssist);
inboxRoutes.post('/compose', inboxController.compose);
