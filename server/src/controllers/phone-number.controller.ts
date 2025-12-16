import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getPhoneNumberStatus,
  getQualityRatingInfo,
  getStatusInfo,
  getThroughputInfo
} from '../services/phone-number.service';

/**
 * 获取电话号码状态
 */
export const getPhoneNumberStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const status = await getPhoneNumberStatus();
    
    // 添加额外的信息
    const qualityInfo = getQualityRatingInfo(status.quality_rating);
    const statusInfo = getStatusInfo(status.status);
    const throughputInfo = getThroughputInfo(status.throughput.level, status.throughput.limit);

    res.json({
      success: true,
      data: {
        ...status,
        quality_info: qualityInfo,
        status_info: statusInfo,
        throughput_info: throughputInfo
      }
    });
  } catch (error: any) {
    console.error('Get phone number status controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to get phone number status'
    });
  }
};
