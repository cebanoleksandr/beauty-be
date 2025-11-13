import express from 'express';
import * as serviceController from '../controllers/service.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', catchError(serviceController.get));
router.get('/:id', catchError(serviceController.getOne));
router.patch('/:id', catchError(serviceController.update));
router.delete('/:id', catchError(serviceController.remove));
router.post('/create', catchError(serviceController.create));
