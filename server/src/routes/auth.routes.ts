import { Router } from 'express';
import { facebookLogin, facebookCallback, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/facebook', facebookLogin);
router.get('/facebook/callback', facebookCallback);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
