import express from 'express';
import * as masterScheduleController from '../controllers/masterSchedule.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', catchError(masterScheduleController.get));
router.get('/:id', catchError(masterScheduleController.getOne));
router.patch('/:id', catchError(masterScheduleController.update));
router.delete('/:id', catchError(masterScheduleController.remove));
router.post('/create', catchError(masterScheduleController.create));
