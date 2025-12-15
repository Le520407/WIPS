import express from 'express';
import blockUsersController from '../controllers/block-users.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Block users
router.post('/:phoneNumberId/block', blockUsersController.blockUsers);

// Unblock users
router.post('/:phoneNumberId/unblock', blockUsersController.unblockUsers);

// Get blocked users list
router.get('/:phoneNumberId', blockUsersController.getBlockedUsers);

// Sync blocked users from Meta
router.post('/:phoneNumberId/sync', blockUsersController.syncBlockedUsers);

export default router;
