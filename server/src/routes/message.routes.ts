import { Router } from 'express';
import { getMessages, sendMessage, getConversations } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getMessages);
router.post('/send', sendMessage);
router.get('/conversations', getConversations);

export default router;
