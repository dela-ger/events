import express from 'express';
import { initializePurchase, verifyPayment, paystackWebhook } from './payments.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/initialize',authenticate, initializePurchase);
router.get('/verify', authenticate, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

export default router;