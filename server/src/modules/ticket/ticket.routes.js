import express from 'express';
import { createTicket, getTicketsByEvent, updateTicket, deleteTicket } from './ticket.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createTicket); // protected
router.get('/', authenticate, getTicketsByEvent); // protected
router.put('/:id', authenticate, updateTicket); // protected
router.delete('/:id', authenticate, deleteTicket); // protected

export default router;
