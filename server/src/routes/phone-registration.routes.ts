import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getRegistrationInfoController,
  requestVerificationCodeController,
  verifyCodeController,
  registerPhoneNumberController,
  deregisterPhoneNumberController
} from '../controllers/phone-registration.controller';

const router = Router();

// 获取注册信息
router.get('/info', authMiddleware, getRegistrationInfoController);

// 请求验证码
router.post('/request-code', authMiddleware, requestVerificationCodeController);

// 验证验证码
router.post('/verify-code', authMiddleware, verifyCodeController);

// 注册电话号码
router.post('/register', authMiddleware, registerPhoneNumberController);

// 注销电话号码
router.delete('/deregister', authMiddleware, deregisterPhoneNumberController);

export default router;
