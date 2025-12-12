import { Request, Response } from 'express';
import Website from '../models/Website';
import ApiKey from '../models/ApiKey';
import ApiUsage from '../models/ApiUsage';
import MessageLog from '../models/MessageLog';
import { Op } from 'sequelize';

class UsageStatsController {
  /**
   * 获取总体使用概览
   */
  async getOverview(req: Request, res: Response) {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      // 统计网站数量
      const totalWebsites = await Website.count();
      const activeWebsites = await Website.count({ where: { is_active: true } });

      // 统计 API 密钥
      const totalApiKeys = await ApiKey.count();
      const activeApiKeys = await ApiKey.count({ where: { is_active: true } });

      // 统计消息
      const totalMessages = await MessageLog.count({
        where: {
          created_at: { [Op.gte]: startDate },
        },
      });

      const successMessages = await MessageLog.count({
        where: {
          created_at: { [Op.gte]: startDate },
          status: { [Op.in]: ['sent', 'delivered', 'read'] },
        },
      });

      const failedMessages = await MessageLog.count({
        where: {
          created_at: { [Op.gte]: startDate },
          status: 'failed',
        },
      });

      // 统计 API 使用
      const apiUsageStats = await ApiUsage.findAll({
        where: {
          date: { [Op.gte]: startDate },
        },
        attributes: [
          [ApiUsage.sequelize!.fn('SUM', ApiUsage.sequelize!.col('request_count')), 'totalRequests'],
          [ApiUsage.sequelize!.fn('SUM', ApiUsage.sequelize!.col('success_count')), 'totalSuccess'],
          [ApiUsage.sequelize!.fn('SUM', ApiUsage.sequelize!.col('error_count')), 'totalErrors'],
        ],
        raw: true,
      });

      const usage = apiUsageStats[0] as any;

      res.json({
        success: true,
        data: {
          websites: {
            total: totalWebsites,
            active: activeWebsites,
            inactive: totalWebsites - activeWebsites,
          },
          apiKeys: {
            total: totalApiKeys,
            active: activeApiKeys,
            inactive: totalApiKeys - activeApiKeys,
          },
          messages: {
            total: totalMessages,
            success: successMessages,
            failed: failedMessages,
            successRate: totalMessages > 0 ? ((successMessages / totalMessages) * 100).toFixed(2) : '0',
          },
          apiUsage: {
            totalRequests: parseInt(usage?.totalRequests || '0'),
            totalSuccess: parseInt(usage?.totalSuccess || '0'),
            totalErrors: parseInt(usage?.totalErrors || '0'),
          },
        },
      });
    } catch (error: any) {
      console.error('Error getting overview:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 获取网站使用统计
   */
  async getWebsiteStats(req: Request, res: Response) {
    try {
      const { websiteId } = req.params;
      const { days = 30 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      // 获取网站信息
      const website = await Website.findByPk(websiteId);
      if (!website) {
        return res.status(404).json({
          success: false,
          error: 'Website not found',
        });
      }

      // 获取 API 密钥
      const apiKeys = await ApiKey.findAll({
        where: { website_id: websiteId },
        attributes: ['id', 'key_name', 'is_active', 'last_used_at', 'created_at'],
      });

      // 获取消息统计
      const messages = await MessageLog.findAll({
        where: {
          website_id: websiteId,
          created_at: { [Op.gte]: startDate },
        },
      });

      const messageStats = {
        total: messages.length,
        inbound: messages.filter(m => m.direction === 'inbound').length,
        outbound: messages.filter(m => m.direction === 'outbound').length,
        byStatus: {
          sent: messages.filter(m => m.status === 'sent').length,
          delivered: messages.filter(m => m.status === 'delivered').length,
          read: messages.filter(m => m.status === 'read').length,
          failed: messages.filter(m => m.status === 'failed').length,
        },
        byDay: {} as Record<string, number>,
      };

      // 按天统计
      messages.forEach(msg => {
        const day = msg.created_at.toISOString().split('T')[0];
        messageStats.byDay[day] = (messageStats.byDay[day] || 0) + 1;
      });

      // 获取 API 使用统计
      const apiUsage = await ApiUsage.findAll({
        where: {
          website_id: websiteId,
          date: { [Op.gte]: startDate },
        },
        order: [['date', 'ASC']],
      });

      const usageByDay = apiUsage.reduce((acc, usage) => {
        const day = new Date(usage.date).toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = {
            requests: 0,
            success: 0,
            errors: 0,
          };
        }
        acc[day].requests += usage.request_count;
        acc[day].success += usage.success_count;
        acc[day].errors += usage.error_count;
        return acc;
      }, {} as Record<string, { requests: number; success: number; errors: number }>);

      res.json({
        success: true,
        data: {
          website: {
            id: website.id,
            name: website.name,
            domain: website.domain,
            isActive: website.is_active,
          },
          apiKeys: {
            total: apiKeys.length,
            active: apiKeys.filter(k => k.is_active).length,
            keys: apiKeys,
          },
          messages: messageStats,
          apiUsage: {
            byDay: usageByDay,
            total: {
              requests: apiUsage.reduce((sum, u) => sum + u.request_count, 0),
              success: apiUsage.reduce((sum, u) => sum + u.success_count, 0),
              errors: apiUsage.reduce((sum, u) => sum + u.error_count, 0),
            },
          },
        },
      });
    } catch (error: any) {
      console.error('Error getting website stats:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 获取实时统计
   */
  async getRealtimeStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 最近一小时的消息
      const recentMessages = await MessageLog.count({
        where: {
          created_at: { [Op.gte]: oneHourAgo },
        },
      });

      // 最近一小时的 API 请求
      const recentApiCalls = await ApiUsage.findAll({
        where: {
          date: { [Op.gte]: oneHourAgo },
        },
        attributes: [
          [ApiUsage.sequelize!.fn('SUM', ApiUsage.sequelize!.col('request_count')), 'total'],
        ],
        raw: true,
      });

      // 活跃的网站（最近一小时有消息）
      const activeWebsites = await MessageLog.findAll({
        where: {
          created_at: { [Op.gte]: oneHourAgo },
        },
        attributes: ['website_id'],
        group: ['website_id'],
        raw: true,
      });

      res.json({
        success: true,
        data: {
          messagesLastHour: recentMessages,
          apiCallsLastHour: parseInt((recentApiCalls[0] as any)?.total || '0'),
          activeWebsites: activeWebsites.length,
          timestamp: now.toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Error getting realtime stats:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 获取消息趋势
   */
  async getMessageTrends(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const messages = await MessageLog.findAll({
        where: {
          created_at: { [Op.gte]: startDate },
        },
        attributes: [
          [MessageLog.sequelize!.fn('DATE', MessageLog.sequelize!.col('created_at')), 'date'],
          [MessageLog.sequelize!.fn('COUNT', MessageLog.sequelize!.col('id')), 'count'],
          'direction',
          'status',
        ],
        group: ['date', 'direction', 'status'],
        order: [[MessageLog.sequelize!.fn('DATE', MessageLog.sequelize!.col('created_at')), 'ASC']],
        raw: true,
      });

      res.json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      console.error('Error getting message trends:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 获取错误日志
   */
  async getErrorLogs(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const errors = await MessageLog.findAndCountAll({
        where: {
          status: 'failed',
        },
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json({
        success: true,
        data: {
          total: errors.count,
          errors: errors.rows,
        },
      });
    } catch (error: any) {
      console.error('Error getting error logs:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new UsageStatsController();
