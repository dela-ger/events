import express from 'express';
import  { purchaseTicket } from './sales.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/sales', authenticate, purchaseTicket); // protected

export default router;