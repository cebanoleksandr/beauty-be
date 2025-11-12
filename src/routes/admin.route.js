import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', authMiddleware, catchError(adminController.get));
router.get('/:id', authMiddleware, catchError(adminController.getOne));
router.patch('/:id', authMiddleware, catchError(adminController.update));
router.delete('/:id', authMiddleware, catchError(adminController.remove));
router.post('/login', catchError(adminController.login));
router.post('/register', catchError(adminController.register));
