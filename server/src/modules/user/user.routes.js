import express from 'express';
import { getUserProfile, listCRMUsers, listUsersForCompany } from './user.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/:id', authenticate, getUserProfile); // protected
router.get('/', authenticate, listUsersForCompany); // protected
router.get('/crm', authenticate, listCRMUsers)

export default router;