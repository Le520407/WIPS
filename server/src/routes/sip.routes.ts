import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getSipConfig,
  updateSipConfig,
  getSipPassword,
  resetSipPassword,
  syncWithMeta,
  validateTlsCertificate,
  getSipStatus,
} from '../controllers/sip.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get SIP configuration
router.get('/config', getSipConfig);

// Update SIP configuration
router.post('/config', updateSipConfig);

// Get SIP password
router.get('/password', getSipPassword);

// Reset SIP password
router.post('/password/reset', resetSipPassword);

// Sync with Meta API
router.post('/sync', syncWithMeta);

// Validate TLS certificate
router.post('/validate-tls', validateTlsCertificate);

// Get SIP status
router.get('/status', getSipStatus);

export default router;
