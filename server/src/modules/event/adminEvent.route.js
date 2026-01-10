import express from 'express';
import { publishEvent, unpublishEvent } from './adminEvent.controller.js';
import { authenticate } from '../auth/auth.middleware.js';  

const router = express.Router();

// Publish an event (draft → published)
router.patch('/events/:id/publish', authenticate, publishEvent);

// Unpublish an event (published → draft)
router.patch('/events/:id/unpublish', authenticate, unpublishEvent);

export default router;