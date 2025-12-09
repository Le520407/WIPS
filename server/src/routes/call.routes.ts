import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getCalls,
  getCall,
  initiateCall,
  getCallStats,
  acceptCall,
  rejectCall,
  terminateCall,
  preAcceptCall,
} from '../controllers/call.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all calls
router.get('/', getCalls);

// Get call statistics
router.get('/stats', getCallStats);

// Get specific call
router.get('/:id', getCall);

// Initiate outgoing call
router.post('/', initiateCall);

// Accept incoming call
router.post('/accept', acceptCall);

// Reject incoming call
router.post('/reject', rejectCall);

// Terminate active call
router.post('/terminate', terminateCall);

// Pre-accept call (for faster connection)
router.post('/pre-accept', preAcceptCall);

export default router;
