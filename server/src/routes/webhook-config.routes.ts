import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getWebhookConfig,
  saveWebhookConfig,
  testWebhook,
  setWABAOverride,
  deleteWABAOverride,
  setPhoneOverride,
  deletePhoneOverride,
  getWebhookLogs
} from '../controllers/webhook-config.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Webhook configuration
router.get('/config', getWebhookConfig);
router.post('/config', saveWebhookConfig);
router.post('/test', testWebhook);

// WABA override
router.post('/waba-override', setWABAOverride);
router.delete('/waba-override', deleteWABAOverride);

// Phone number override
router.post('/phone-override', setPhoneOverride);
router.delete('/phone-override', deletePhoneOverride);

// Webhook logs
router.get('/logs', getWebhookLogs);

export default router;
