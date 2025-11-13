import express from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', catchError(appointmentController.get));
router.get('/:id', catchError(appointmentController.getOne));
router.patch('/:id', catchError(appointmentController.update));
router.delete('/:id', catchError(appointmentController.remove));
router.post('/create', catchError(appointmentController.create));
