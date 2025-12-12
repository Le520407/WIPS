import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import notificationService from '../services/notification.service';
import { v4 as uuidv4 } from 'uuid';

// SSE endpoint for real-time notifications
export const subscribeToNotifications = (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const clientId = uuidv4();

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Add CORS headers if needed
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5174');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Flush headers
  res.flushHeaders();

  // Add client to notification service
  notificationService.addClient(userId, clientId, res);

  console.log(`✅ User ${userId} subscribed to notifications (Client: ${clientId})`);
};

// Get notification service stats (for debugging)
export const getNotificationStats = (req: AuthRequest, res: Response) => {
  const stats = notificationService.getStats();
  res.json(stats);
};

// Test notification endpoint (for development)
export const sendTestNotification = (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { type, data } = req.body;

  const sent = notificationService.sendNotification(userId, type || 'test', data || { message: 'Test notification' });

  res.json({
    success: sent,
    message: sent ? 'Notification sent' : 'No connected clients',
  });
};
