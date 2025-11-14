import express from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, listEvents, getEventSummary } from './event.controller.js';
import {  authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createEvent); // protected
router.get('/', authenticate, getEvents); // protected
router.get('/:id', authenticate, getEventById); // protected
router.put('/:id', authenticate, updateEvent); // protected
router.delete('/:id', authenticate, deleteEvent); // protected
router.get('/', authenticate, listEvents)
router.get('/:id/summary', authenticate, getEventSummary)

export default router;