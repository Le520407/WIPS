import express from 'express';
import usageStatsController from '../controllers/usage-stats.controller';

const router = express.Router();

// 总体统计
router.get('/overview', usageStatsController.getOverview);

// 网站统计
router.get('/websites/:websiteId', usageStatsController.getWebsiteStats);

// 实时统计
router.get('/realtime', usageStatsController.getRealtimeStats);

// 消息趋势
router.get('/trends/messages', usageStatsController.getMessageTrends);

// 错误日志
router.get('/errors', usageStatsController.getErrorLogs);

export default router;
