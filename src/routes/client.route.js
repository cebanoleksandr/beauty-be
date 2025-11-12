import express from 'express';
import * as clientController from '../controllers/client.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', authMiddleware, catchError(clientController.get));
router.get('/:id', authMiddleware, catchError(clientController.getOne));
router.patch('/:id', authMiddleware, catchError(clientController.update));
router.delete('/:id', authMiddleware, catchError(clientController.remove));
router.post('/login', catchError(clientController.login));
router.post('/register', catchError(clientController.register));
