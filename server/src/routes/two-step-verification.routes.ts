import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  setTwoStepPinController,
  removeTwoStepPinController,
  getTwoStepInfoController
} from '../controllers/two-step-verification.controller';

const router = Router();

// 获取两步验证信息
router.get('/info', authMiddleware, getTwoStepInfoController);

// 设置 PIN
router.post('/set-pin', authMiddleware, setTwoStepPinController);

// 删除 PIN
router.delete('/remove-pin', authMiddleware, removeTwoStepPinController);

export default router;
