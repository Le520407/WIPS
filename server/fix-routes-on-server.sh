#!/bin/bash

# Fix route order on production server
# This script updates the call.routes.ts file directly on the server

echo "🔧 Fixing route order in call.routes.ts..."

# Backup current file
cp /var/www/whatsapp-integration/server/src/routes/call.routes.ts /var/www/whatsapp-integration/server/src/routes/call.routes.ts.backup

# Create the fixed file
cat > /var/www/whatsapp-integration/server/src/routes/call.routes.ts << 'EOF'
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
  markCallsAsViewed,
  getUnviewedMissedCallsCount,
} from '../controllers/call.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all calls
router.get('/', getCalls);

// Get call statistics
router.get('/stats', getCallStats);

// Get unviewed missed calls count (must be before /:id route)
router.get('/unviewed-count', getUnviewedMissedCallsCount);

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

// Mark calls as viewed
router.post('/mark-viewed', markCallsAsViewed);

export default router;
EOF

echo "✅ File updated"
echo "🔄 Restarting PM2 process 5..."

pm2 restart 5

echo "✅ Done! Route order fixed."
echo ""
echo "The /unviewed-count route is now BEFORE the /:id route"
