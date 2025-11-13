import express from 'express';
import * as scheduleExceptionController from '../controllers/scheduleException.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', catchError(scheduleExceptionController.get));
router.get('/:id', catchError(scheduleExceptionController.getOne));
router.patch('/:id', catchError(scheduleExceptionController.update));
router.delete('/:id', catchError(scheduleExceptionController.remove));
router.post('/create', catchError(scheduleExceptionController.create));
