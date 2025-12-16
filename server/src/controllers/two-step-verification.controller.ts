import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  setTwoStepPin,
  removeTwoStepPin,
  validatePin,
  getTwoStepInfo
} from '../services/two-step-verification.service';

/**
 * 设置两步验证 PIN
 */
export const setTwoStepPinController = async (req: AuthRequest, res: Response) => {
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

    const result = await setTwoStepPin(pin);
    
    res.json({
      success: true,
      message: 'Two-step verification PIN set successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Set two-step PIN controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to set two-step verification PIN'
    });
  }
};

/**
 * 删除两步验证 PIN
 */
export const removeTwoStepPinController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await removeTwoStepPin();
    
    res.json({
      success: true,
      message: 'Two-step verification PIN removed successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Remove two-step PIN controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to remove two-step verification PIN'
    });
  }
};

/**
 * 获取两步验证信息
 */
export const getTwoStepInfoController = async (req: AuthRequest, res: Response) => {
  try {
    const info = getTwoStepInfo();
    
    res.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    console.error('Get two-step info controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get two-step verification info'
    });
  }
};
