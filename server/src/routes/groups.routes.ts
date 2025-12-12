import { Router } from 'express';
import groupsController from '../controllers/groups.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Optional authentication - will use default user if not authenticated
// This allows testing without login
// router.use(authMiddleware);

// Group management
router.post('/', groupsController.createGroup);
router.get('/', groupsController.getGroups);
router.get('/:id', groupsController.getGroupInfo);
router.post('/:id', groupsController.updateGroup);
router.delete('/:id', groupsController.deleteGroup);

// Invite link management
router.get('/:id/invite-link', groupsController.getInviteLink);
router.post('/:id/invite-link', groupsController.resetInviteLink);

// Participant management
router.delete('/:id/participants', groupsController.removeParticipants);

// Join request management
router.get('/:id/join-requests', groupsController.getJoinRequests);
router.post('/:id/join-requests', groupsController.approveJoinRequests);
router.delete('/:id/join-requests', groupsController.rejectJoinRequests);

// Group messaging
router.post('/:id/messages', groupsController.sendGroupMessage);

export default router;
