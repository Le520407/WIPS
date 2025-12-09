import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getCallSettings,
  updateCallSettings,
  checkCallingAllowed,
  getBusinessHoursStatus,
} from '../controllers/call-settings.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get call settings
router.get('/', getCallSettings);

// Update call settings
router.put('/', updateCallSettings);

// Check if calling is currently allowed
router.get('/check-allowed', checkCallingAllowed);

// Get business hours status
router.get('/business-hours-status', getBusinessHoursStatus);

export default router;
