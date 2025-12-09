import express from 'express';
import {
  getPermissionStatus,
  requestPermission,
  listPermissions,
} from '../controllers/call-permission.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get permission status for a specific phone number
router.get('/permissions/:phone_number', getPermissionStatus);

// Request call permission from a user
router.post('/permissions/request', requestPermission);

// List all permissions
router.get('/permissions', listPermissions);

export default router;
