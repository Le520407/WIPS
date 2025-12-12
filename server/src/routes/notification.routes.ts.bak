import express, { Request, Response, NextFunction } from 'express';
import { subscribeToNotifications, getNotificationStats, sendTestNotification } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Special middleware for SSE that accepts token from query parameter
// (EventSource doesn't support custom headers)
const sseAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get token from query parameter first (for EventSource)
    let token = req.query.token as string;
    
    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// SSE endpoint for real-time notifications (uses query token)
router.get('/subscribe', sseAuthMiddleware, subscribeToNotifications);

// Other routes use normal auth middleware
router.use(authMiddleware);

// Get notification service stats
router.get('/stats', getNotificationStats);

// Send test notification (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', sendTestNotification);
}

export default router;
