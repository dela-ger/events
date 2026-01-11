import express from 'express';
import { getPublicTickets } from '../ticket/publicTicket.controller.js';

const router = express.Router();

// GET /public/events/:id/tickets
router.get('/events/:id/tickets', getPublicTickets);

export default router;
