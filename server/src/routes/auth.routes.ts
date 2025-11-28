import { Router } from 'express';
import { facebookLogin, facebookCallback, getCurrentUser, testUserLogin, embeddedSignup } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/facebook', facebookLogin);
router.post('/test-login', testUserLogin);
router.post('/embedded-signup', embeddedSignup);
router.get('/facebook/callback', facebookCallback);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
