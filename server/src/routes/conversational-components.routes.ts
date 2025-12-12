import express from 'express';
import conversationalComponentsController from '../controllers/conversational-components.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get configuration
router.get('/:phoneNumberId', conversationalComponentsController.getConfiguration);

// Toggle welcome message
router.post('/:phoneNumberId/welcome', conversationalComponentsController.toggleWelcomeMessage);

// Set ice breakers
router.post('/:phoneNumberId/ice-breakers', conversationalComponentsController.setIceBreakers);

// Set commands
router.post('/:phoneNumberId/commands', conversationalComponentsController.setCommands);

// Sync from Meta
router.post('/:phoneNumberId/sync', conversationalComponentsController.syncFromMeta);

// Update all configuration
router.post('/:phoneNumberId', conversationalComponentsController.updateConfiguration);

export default router;
