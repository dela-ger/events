import express from 'express';
import  { purchaseTicket, listSales, getMySales, 
    getSalesByEvent, getDashboardSummary, getSalesByUser,
    getUserPurchaseSummary } from './sales.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
 
const router = express.Router();

router.post('/sales', authenticate, purchaseTicket); // protected
router.get('/sales', authenticate, listSales); // protected
router.get('/user/me/sales', authenticate, getMySales)
router.get('/events/:id/sales', authenticate, getSalesByEvent);
router.get('/dashboard/summary', authenticate, getDashboardSummary);
router.get('/users/:id/sales', authenticate, getSalesByUser)
router.get('/users/:id/summary', authenticate, getUserPurchaseSummary);

export default router;