import { Router } from 'express';
import { listsController } from '../controllers/lists.controller.js';

export const listsRoutes = Router();

listsRoutes.get('/', listsController.list);
listsRoutes.get('/:id', listsController.get);
listsRoutes.post('/', listsController.create);
listsRoutes.put('/:id', listsController.update);
listsRoutes.delete('/:id', listsController.delete);

// Contact management within lists
listsRoutes.get('/:id/contacts', listsController.getContacts);
listsRoutes.post('/:id/contacts', listsController.addContacts);
listsRoutes.delete('/:id/contacts', listsController.removeContacts);
