import { Router } from 'express';
import { tagsController } from '../controllers/tags.controller.js';

export const tagRoutes = Router();

tagRoutes.get('/', tagsController.list);
tagRoutes.post('/', tagsController.create);
tagRoutes.put('/:id', tagsController.update);
tagRoutes.delete('/:id', tagsController.delete);
