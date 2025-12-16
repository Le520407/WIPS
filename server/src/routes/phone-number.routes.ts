import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getPhoneNumberStatusController
} from '../controllers/phone-number.controller';

const router = Router();

// 获取电话号码状态
router.get('/status', authMiddleware, getPhoneNumberStatusController);

export default router;
