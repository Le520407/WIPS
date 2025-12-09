import express from 'express';
import {
  getAnalyticsDashboard,
  getCallTrends,
  getContactAnalytics,
  exportCallData,
  getPerformanceMetrics
} from '../controllers/call-analytics.controller';

const router = express.Router();

/**
 * Call Analytics Routes
 * 
 * 通话分析和报表路由
 */

// 获取分析仪表板
router.get('/dashboard', getAnalyticsDashboard);

// 获取通话趋势
router.get('/trends', getCallTrends);

// 获取联系人分析
router.get('/contact/:phone_number', getContactAnalytics);

// 导出通话数据
router.get('/export', exportCallData);

// 获取性能指标
router.get('/performance', getPerformanceMetrics);

export default router;
