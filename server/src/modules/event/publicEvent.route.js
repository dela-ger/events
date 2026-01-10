import express from 'express';
import { getPublishedEvents } from './publicEvent.controller.js';

const router = express.Router();

// Public endpoints (no auth middleware here)
router.get('/events', getPublishedEvents);

export default router;