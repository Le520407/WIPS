import express from 'express';
import {
  getQualityByPhone,
  getAllQuality,
  getQualityDashboard,
  resetWarning,
} from '../controllers/call-quality.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get quality dashboard
router.get('/dashboard', getQualityDashboard);

// Get all quality metrics
router.get('/', getAllQuality);

// Get quality for specific phone number
router.get('/:phone_number', getQualityByPhone);

// Reset warning for a contact
router.post('/:phone_number/reset-warning', resetWarning);

export default router;
