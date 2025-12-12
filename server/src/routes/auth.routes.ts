import { Router } from 'express';
import { facebookLogin, facebookCallback, getCurrentUser, testUserLogin, embeddedSignup, passwordLogin, manualSignup } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/facebook', facebookLogin);
router.post('/test-login', testUserLogin);
router.post('/login', passwordLogin);
router.post('/embedded-signup', embeddedSignup);
router.post('/manual-signup', manualSignup);
router.get('/facebook/callback', facebookCallback);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
