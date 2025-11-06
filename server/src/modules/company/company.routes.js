import express from 'express';
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany } from './company.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createCompany); // protected
router.get('/', getCompanies); // public
router.get('/:id', getCompanyById); // public
router.put('/:id', authenticate, updateCompany); // protected
router.delete('/:id', authenticate, deleteCompany); // protected

export default router;