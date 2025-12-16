import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  registerPhoneNumber,
  deregisterPhoneNumber,
  requestVerificationCode,
  verifyCode,
  getRegistrationInfo,
  validatePin,
  validateVerificationCode
} from '../services/phone-registration.service';

/**
 * 获取注册信息
 */
export const getRegistrationInfoController = async (req: AuthRequest, res: Response) => {
  try {
    const info = getRegistrationInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    console.error('Get registration info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get registration info'
    });
  }
};

/**
 * 请求验证码
 */
export const requestVerificationCodeController = async (req: AuthRequest, res: Response) => {
  try {
    const { code_method = 'SMS', language = 'en_US' } = req.body;

    // 验证 code_method
    if (code_method !== 'SMS' && code_method !== 'VOICE') {
      return res.status(400).json({
        success: false,
        error: 'code_method must be either SMS or VOICE'
      });
    }

    const result = await requestVerificationCode(code_method, language);
    
    res.json({
      success: true,
      message: `Verification code sent via ${code_method}`,
      data: result
    });
  } catch (error: any) {
    console.error('Request verification code controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to request verification code'
    });
  }
};

/**
 * 验证验证码
 */
export const verifyCodeController = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    // 验证验证码
    const validation = validateVerificationCode(code);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const result = await verifyCode(code);
    
    res.json({
      success: true,
      message: 'Verification code verified successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Verify code controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to verify code'
    });
  }
};

/**
 * 注册电话号码
 */
export const registerPhoneNumberController = async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;

    // 验证 PIN
    const validation = validatePin(pin);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const result = await registerPhoneNumber(pin);
    
    res.json({
      success: true,
      message: 'Phone number registered successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Register phone number controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to register phone number'
    });
  }
};

/**
 * 注销电话号码
 */
export const deregisterPhoneNumberController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deregisterPhoneNumber();
    
    res.json({
      success: true,
      message: 'Phone number deregistered successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Deregister phone number controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to deregister phone number'
    });
  }
};
