import express from 'express';
import { initializePayment, verifyPayment } from '../payments/publicPurchase.controller.js';

const router = express.Router();

// Customer starts a payment (buy ticket)
router.post('/events/:eventId/tickets/:ticketId/purchase', initializePayment);

// Paystack webhook callback (Paystack calls this, not the customer)
router.post('/payments/webhook', verifyPayment);

export default router;
