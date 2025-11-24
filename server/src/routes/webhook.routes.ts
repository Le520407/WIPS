import { Router } from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/webhook.controller';

const router = Router();

router.get('/whatsapp', verifyWebhook);
router.post('/whatsapp', handleWebhook);

export default router;
