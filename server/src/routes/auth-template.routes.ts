import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createAuthTemplate,
  getAuthTemplates,
  getAuthTemplate,
  deleteAuthTemplate,
  sendOTP,
  verifyOTP,
  getTemplatePreviews,
  getOTPHistory,
} from '../controllers/auth-template.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Template management
router.post('/templates', createAuthTemplate);
router.get('/templates', getAuthTemplates);
router.get('/templates/:id', getAuthTemplate);
router.delete('/templates/:id', deleteAuthTemplate);

// Template previews
router.get('/previews', getTemplatePreviews);

// OTP operations
router.post('/send', sendOTP);
router.post('/verify', verifyOTP);
router.get('/history', getOTPHistory);

export default router;
