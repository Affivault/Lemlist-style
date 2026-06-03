import { Router } from 'express';
import { listFoldersController } from '../controllers/list-folders.controller.js';

export const listFoldersRoutes = Router();

listFoldersRoutes.get('/',                listFoldersController.list);
listFoldersRoutes.get('/trash',           listFoldersController.listTrashed);
listFoldersRoutes.post('/',               listFoldersController.create);
listFoldersRoutes.patch('/:id',           listFoldersController.update);
listFoldersRoutes.delete('/:id',          listFoldersController.delete);
listFoldersRoutes.post('/move',           listFoldersController.moveList);
listFoldersRoutes.post('/:id/trash',      listFoldersController.trashList);
listFoldersRoutes.post('/:id/restore',    listFoldersController.restoreList);
