import express from 'express';
import {
  sendCallButtonMessage,
  createCallButtonTemplate,
  sendCallButtonTemplate,
  generateCallDeepLink,
  sendCallDeepLinkMessage,
} from '../controllers/call-button.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send interactive call button message (free-form)
router.post('/send', sendCallButtonMessage);

// Create call button template
router.post('/template/create', createCallButtonTemplate);

// Send call button template message
router.post('/template/send', sendCallButtonTemplate);

// Generate call deep link
router.post('/deeplink/generate', generateCallDeepLink);

// Send message with call deep link
router.post('/deeplink/send', sendCallDeepLinkMessage);

export default router;
