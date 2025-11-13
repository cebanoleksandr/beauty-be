import express from 'express';
import * as materialController from '../controllers/material.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', catchError(materialController.get));
router.get('/:id', catchError(materialController.getOne));
router.patch('/:id', catchError(materialController.update));
router.delete('/:id', catchError(materialController.remove));
router.post('/create', catchError(materialController.create));
