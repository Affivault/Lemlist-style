import { Router } from 'express';
import { sendingSchedulesController } from '../controllers/sending-schedules.controller.js';

export const sendingSchedulesRoutes = Router();

sendingSchedulesRoutes.get('/',          sendingSchedulesController.list);
sendingSchedulesRoutes.get('/default',   sendingSchedulesController.getDefault);
sendingSchedulesRoutes.post('/',         sendingSchedulesController.create);
sendingSchedulesRoutes.patch('/:id',     sendingSchedulesController.update);
sendingSchedulesRoutes.delete('/:id',    sendingSchedulesController.delete);
