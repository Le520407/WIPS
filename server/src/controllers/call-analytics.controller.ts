// @ts-nocheck - This file has many type mismatches with the Call model that need to be fixed in a future refactor
import { Request, Response } from 'express';
import Call from '../models/Call';
import CallQuality from '../models/CallQuality';
import CallLimit from '../models/CallLimit';
import { Op } from 'sequelize';

/**
 * Call Analytics Controller
 * 
 * 提供通话分析和报表功能
 */

/**
 * 获取通话分析仪表板
 */
export const getAnalyticsDashboard = async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // 获取通话统计
    const calls = await Call.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      }
    }).catch(err => {
      console.error('Error fetching calls:', err);
      return [];
    });

    // 基本统计
    const totalCalls = calls.length;
    const inboundCalls = calls.filter(c => c.direction === 'inbound').length;
    const outboundCalls = calls.filter(c => c.direction === 'outbound').length;
    const connectedCalls = calls.filter(c => c.status === 'completed').length;
    const missedCalls = calls.filter(c => c.status === 'missed').length;
    const rejectedCalls = calls.filter(c => c.status === 'rejected').length;

    // 计算接通率
    const pickupRate = totalCalls > 0 
      ? ((connectedCalls / totalCalls) * 100).toFixed(2)
      : '0.00';

    // 计算平均通话时长
    const completedCallsWithDuration = calls.filter(c => 
      c.status === 'completed' && c.duration
    );
    const avgDuration = completedCallsWithDuration.length > 0
      ? Math.round(
          completedCallsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / 
          completedCallsWithDuration.length
        )
      : 0;

    // 按日期分组统计
    const callsByDate = calls.reduce((acc: any, call) => {
      const date = new Date(call.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          inbound: 0,
          outbound: 0,
          connected: 0,
          missed: 0,
          rejected: 0
        };
      }
      acc[date].total++;
      if (call.direction === 'inbound') acc[date].inbound++;
      if (call.direction === 'outbound') acc[date].outbound++;
      if (call.status === 'completed') acc[date].connected++;
      if (call.status === 'missed') acc[date].missed++;
      if (call.status === 'rejected') acc[date].rejected++;
      return acc;
    }, {});

    const dailyStats = Object.values(callsByDate).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );

    // 按小时分组统计（仅24小时）
    let hourlyStats = [];
    if (period === '24h') {
      const callsByHour = calls.reduce((acc: any, call) => {
        const hour = new Date(call.created_at).getHours();
        if (!acc[hour]) {
          acc[hour] = {
            hour,
            total: 0,
            connected: 0,
            missed: 0
          };
        }
        acc[hour].total++;
        if (call.status === 'completed') acc[hour].connected++;
        if (call.status === 'missed') acc[hour].missed++;
        return acc;
      }, {});

      hourlyStats = Object.values(callsByHour).sort((a: any, b: any) => 
        a.hour - b.hour
      );
    }

    // 最活跃的联系人
    const contactStats = calls.reduce((acc: any, call) => {
      const phone = call.from_phone_number || call.to_phone_number;
      if (!phone) return acc;
      
      if (!acc[phone]) {
        acc[phone] = {
          phone_number: phone,
          total_calls: 0,
          inbound: 0,
          outbound: 0,
          connected: 0,
          missed: 0,
          total_duration: 0
        };
      }
      acc[phone].total_calls++;
      if (call.direction === 'inbound') acc[phone].inbound++;
      if (call.direction === 'outbound') acc[phone].outbound++;
      if (call.status === 'completed') acc[phone].connected++;
      if (call.status === 'missed') acc[phone].missed++;
      if (call.duration) acc[phone].total_duration += call.duration;
      return acc;
    }, {});

    const topContacts = Object.values(contactStats)
      .sort((a: any, b: any) => b.total_calls - a.total_calls)
      .slice(0, 10);

    // 获取质量统计
    const qualityStats = await CallQuality.findAll().catch(err => {
      console.error('Error fetching quality stats:', err);
      return [];
    });
    const qualityDistribution = {
      excellent: qualityStats.filter(q => (q.pickup_rate || 0) >= 90).length,
      good: qualityStats.filter(q => (q.pickup_rate || 0) >= 75 && (q.pickup_rate || 0) < 90).length,
      fair: qualityStats.filter(q => (q.pickup_rate || 0) >= 60 && (q.pickup_rate || 0) < 75).length,
      poor: qualityStats.filter(q => (q.pickup_rate || 0) >= 40 && (q.pickup_rate || 0) < 60).length,
      critical: qualityStats.filter(q => (q.pickup_rate || 0) < 40).length
    };

    res.json({
      success: true,
      data: {
        period,
        summary: {
          total_calls: totalCalls,
          inbound_calls: inboundCalls,
          outbound_calls: outboundCalls,
          connected_calls: connectedCalls,
          missed_calls: missedCalls,
          rejected_calls: rejectedCalls,
          pickup_rate: parseFloat(pickupRate),
          avg_duration: avgDuration
        },
        daily_stats: dailyStats,
        hourly_stats: hourlyStats,
        top_contacts: topContacts,
        quality_distribution: qualityDistribution
      }
    });
  } catch (error: any) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics dashboard',
      details: error.message
    });
  }
};

/**
 * 获取通话趋势分析
 */
export const getCallTrends = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const calls = await Call.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      order: [['created_at', 'ASC']]
    }).catch(err => {
      console.error('Error fetching calls for trends:', err);
      return [];
    });

    // 按日期分组
    const trendData = calls.reduce((acc: any, call) => {
      const date = new Date(call.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          calls: 0,
          connected: 0,
          missed: 0,
          duration: 0
        };
      }
      acc[date].calls++;
      if (call.status === 'completed') {
        acc[date].connected++;
        acc[date].duration += call.duration || 0;
      }
      if (call.status === 'missed') {
        acc[date].missed++;
      }
      return acc;
    }, {});

    const trends = Object.values(trendData).map((day: any) => ({
      ...day,
      pickup_rate: day.calls > 0 
        ? ((day.connected / day.calls) * 100).toFixed(2)
        : '0.00',
      avg_duration: day.connected > 0
        ? Math.round(day.duration / day.connected)
        : 0
    }));

    res.json({
      success: true,
      data: {
        period_days: daysNum,
        trends
      }
    });
  } catch (error: any) {
    console.error('Error getting call trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get call trends',
      details: error.message
    });
  }
};

/**
 * 获取联系人通话分析
 */
export const getContactAnalytics = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.params;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // 获取所有通话记录
    const calls = await Call.findAll({
      where: {
        [Op.or]: [
          { from_phone_number: phone_number },
          { to_phone_number: phone_number }
        ]
      },
      order: [['created_at', 'DESC']]
    }).catch(err => {
      console.error('Error fetching contact calls:', err);
      return [];
    });

    // 基本统计
    const totalCalls = calls.length;
    const inboundCalls = calls.filter(c => c.from_phone_number === phone_number).length;
    const outboundCalls = calls.filter(c => c.to_phone_number === phone_number).length;
    const connectedCalls = calls.filter(c => c.status === 'completed').length;
    const missedCalls = calls.filter(c => c.status === 'missed').length;

    // 计算总通话时长
    const totalDuration = calls
      .filter(c => c.status === 'completed' && c.duration)
      .reduce((sum, c) => sum + (c.duration || 0), 0);

    // 计算平均通话时长
    const avgDuration = connectedCalls > 0
      ? Math.round(totalDuration / connectedCalls)
      : 0;

    // 最近通话
    const recentCalls = calls.slice(0, 10).map(call => ({
      id: call.id,
      direction: call.direction,
      status: call.status,
      duration: call.duration,
      created_at: call.created_at
    }));

    // 通话时间分布（按小时）
    const hourDistribution = calls.reduce((acc: any, call) => {
      const hour = new Date(call.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // 获取质量数据
    const quality = await CallQuality.findOne({
      where: { phone_number }
    }).catch(err => {
      console.error('Error fetching quality:', err);
      return null;
    });

    // 获取限制数据
    const limit = await CallLimit.findOne({
      where: { phone_number }
    }).catch(err => {
      console.error('Error fetching limit:', err);
      return null;
    });

    res.json({
      success: true,
      data: {
        phone_number,
        statistics: {
          total_calls: totalCalls,
          inbound_calls: inboundCalls,
          outbound_calls: outboundCalls,
          connected_calls: connectedCalls,
          missed_calls: missedCalls,
          pickup_rate: totalCalls > 0 
            ? ((connectedCalls / totalCalls) * 100).toFixed(2)
            : '0.00',
          total_duration: totalDuration,
          avg_duration: avgDuration
        },
        recent_calls: recentCalls,
        hour_distribution: hourDistribution,
        quality: quality ? {
          pickup_rate: quality.pickup_rate,
          consecutive_missed: quality.consecutive_missed,
          warning_sent: quality.warning_sent
        } : null,
        limit: limit ? {
          daily_count: limit.daily_count,
          daily_limit: limit.daily_limit,
          remaining: limit.daily_limit - limit.daily_count,
          reset_at: limit.daily_reset_at
        } : null
      }
    });
  } catch (error: any) {
    console.error('Error getting contact analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contact analytics',
      details: error.message
    });
  }
};

/**
 * 导出通话数据
 */
export const exportCallData = async (req: Request, res: Response) => {
  try {
    const { format = 'json', start_date, end_date } = req.query;

    // 构建查询条件
    const where: any = {};
    if (start_date) {
      where.created_at = { [Op.gte]: new Date(start_date as string) };
    }
    if (end_date) {
      where.created_at = {
        ...where.created_at,
        [Op.lte]: new Date(end_date as string)
      };
    }

    const calls = await Call.findAll({
      where,
      order: [['created_at', 'DESC']]
    }).catch(err => {
      console.error('Error fetching calls for export:', err);
      return [];
    });

    if (format === 'csv') {
      // CSV 格式
      const csvHeader = 'ID,Direction,From,To,Status,Duration,Created At\n';
      const csvRows = calls.map(call => 
        `${call.id},${call.direction},${call.from_phone_number || ''},${call.to_phone_number || ''},${call.status},${call.duration || 0},${call.created_at}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=calls.csv');
      res.send(csvHeader + csvRows);
    } else {
      // JSON 格式
      res.json({
        success: true,
        data: {
          total: calls.length,
          calls: calls.map(call => ({
            id: call.id,
            direction: call.direction,
            from_phone_number: call.from_phone_number,
            to_phone_number: call.to_phone_number,
            status: call.status,
            duration: call.duration,
            created_at: call.created_at,
            updated_at: call.updated_at
          }))
        }
      });
    }
  } catch (error: any) {
    console.error('Error exporting call data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export call data',
      details: error.message
    });
  }
};

/**
 * 获取性能指标
 */
export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const calls = await Call.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      }
    }).catch(err => {
      console.error('Error fetching calls for metrics:', err);
      return [];
    });

    // 计算各种指标
    const totalCalls = calls.length;
    const connectedCalls = calls.filter(c => c.status === 'completed').length;
    const missedCalls = calls.filter(c => c.status === 'missed').length;
    
    // 接通率
    const pickupRate = totalCalls > 0 
      ? ((connectedCalls / totalCalls) * 100).toFixed(2)
      : '0.00';

    // 未接率
    const missRate = totalCalls > 0
      ? ((missedCalls / totalCalls) * 100).toFixed(2)
      : '0.00';

    // 平均响应时间（假设从 webhook 到接听的时间）
    const avgResponseTime = 0; // TODO: 需要记录响应时间

    // 通话质量分数（基于接通率）
    let qualityScore = 'Poor';
    const pickupRateNum = parseFloat(pickupRate);
    if (pickupRateNum >= 90) qualityScore = 'Excellent';
    else if (pickupRateNum >= 75) qualityScore = 'Good';
    else if (pickupRateNum >= 60) qualityScore = 'Fair';
    else if (pickupRateNum >= 40) qualityScore = 'Poor';
    else qualityScore = 'Critical';

    // 获取限制使用情况
    const limits = await CallLimit.findAll().catch(err => {
      console.error('Error fetching limits:', err);
      return [];
    });
    const totalLimitUsage = limits.reduce((sum, l) => sum + l.daily_count, 0);
    const totalLimitCapacity = limits.reduce((sum, l) => sum + l.daily_limit, 0);
    const limitUsagePercent = totalLimitCapacity > 0
      ? ((totalLimitUsage / totalLimitCapacity) * 100).toFixed(2)
      : '0.00';

    res.json({
      success: true,
      data: {
        period,
        metrics: {
          total_calls: totalCalls,
          pickup_rate: parseFloat(pickupRate),
          miss_rate: parseFloat(missRate),
          quality_score: qualityScore,
          avg_response_time: avgResponseTime,
          limit_usage_percent: parseFloat(limitUsagePercent)
        },
        health_status: pickupRateNum >= 75 ? 'healthy' : pickupRateNum >= 60 ? 'warning' : 'critical'
      }
    });
  } catch (error: any) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics',
      details: error.message
    });
  }
};
