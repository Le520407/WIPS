import express from 'express';
import {
  getCallLimit,
  checkCallLimit,
  recordCall,
  getAllCallLimits,
  getCallLimitDashboard,
  updateCallLimit,
} from '../controllers/call-limit.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get dashboard
router.get('/dashboard', getCallLimitDashboard);

// Get all call limits
router.get('/', getAllCallLimits);

// Get call limit for specific phone number
router.get('/:phone_number', getCallLimit);

// Check if can make call
router.post('/check', checkCallLimit);

// Record a call (increment counter)
router.post('/record', recordCall);

// Update call limit (admin)
router.put('/:phone_number', updateCallLimit);

export default router;
