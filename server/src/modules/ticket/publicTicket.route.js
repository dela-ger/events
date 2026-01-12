import express from 'express';
import { getPublicTicketDetail, getPublicTickets } from '../ticket/publicTicket.controller.js';

const router = express.Router();

// GET /public/events/:id/tickets
router.get('/events/:id/tickets', getPublicTickets);

// Single ticket detail route
router.get('/events/:eventId/tickets', getPublicTicketDetail)

export default router;
