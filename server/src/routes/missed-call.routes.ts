import express from 'express';
import {
  getMissedCalls,
  getMissedCallsCount,
  initiateCallback,
  sendMissedCallMessage,
  markAsHandled,
  bulkMarkAsHandled,
  getMissedCallsByPhone,
} from '../controllers/missed-call.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get missed calls count (for badge)
router.get('/count', getMissedCallsCount);

// Get all missed calls
router.get('/', getMissedCalls);

// Get missed calls by phone number
router.get('/phone/:phone_number', getMissedCallsByPhone);

// Initiate callback for a missed call
router.post('/:call_id/callback', initiateCallback);

// Send message to missed call contact
router.post('/:call_id/message', sendMissedCallMessage);

// Mark missed call as handled
router.post('/:call_id/mark-handled', markAsHandled);

// Bulk mark as handled
router.post('/bulk/mark-handled', bulkMarkAsHandled);

export default router;
