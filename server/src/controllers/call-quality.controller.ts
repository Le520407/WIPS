import { Request, Response } from 'express';
import CallQuality from '../models/CallQuality';
import CallPermission from '../models/CallPermission';
import Call from '../models/Call';
import { Op } from 'sequelize';
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Update call quality metrics after a call
 */
export async function updateCallQuality(
  userId: string,
  phoneNumber: string,
  callStatus: 'connected' | 'missed' | 'rejected' | 'failed'
): Promise<CallQuality> {
  // Find or create quality record
  let quality = await CallQuality.findOne({
    where: { user_id: userId, phone_number: phoneNumber }
  });

  if (!quality) {
    quality = await CallQuality.create({
      user_id: userId,
      phone_number: phoneNumber,
    });
  }

  // Update counters
  quality.total_calls += 1;
  quality.last_call_at = new Date();

  switch (callStatus) {
    case 'connected':
      quality.connected_calls += 1;
      quality.consecutive_connected += 1;
      quality.consecutive_missed = 0; // Reset missed counter
      quality.last_connected_at = new Date();
      quality.resetWarning(); // Reset warning flag
      break;

    case 'missed':
      quality.missed_calls += 1;
      quality.consecutive_missed += 1;
      quality.consecutive_connected = 0;
      quality.last_missed_at = new Date();
      break;

    case 'rejected':
      quality.rejected_calls += 1;
      quality.consecutive_missed += 1;
      quality.consecutive_connected = 0;
      break;

    case 'failed':
      quality.failed_calls += 1;
      quality.consecutive_connected = 0;
      // Don't count failed calls as missed for consecutive tracking
      break;
  }

  // Update pickup rate
  quality.updatePickupRate();

  await quality.save();

  // Check if warning or revocation needed
  await checkQualityThresholds(quality, userId, phoneNumber);

  return quality;
}

/**
 * Check quality thresholds and take action
 */
async function checkQualityThresholds(
  quality: CallQuality,
  userId: string,
  phoneNumber: string
): Promise<void> {
  // Check if revocation needed
  if (quality.needsRevocation()) {
    console.log(`🚨 Revoking permission for ${phoneNumber} due to ${quality.consecutive_missed} consecutive missed calls`);
    
    // Update permission status
    const permission = await CallPermission.findOne({
      where: { user_id: userId, phone_number: phoneNumber }
    });

    if (permission) {
      permission.status = 'revoked';
      permission.revoked_at = new Date();
      await permission.save();
    }

    // Send revocation notification to user
    await sendRevocationNotification(phoneNumber, quality.consecutive_missed);
    
    return;
  }

  // Check if warning needed
  if (quality.needsWarning()) {
    console.log(`⚠️ Sending warning to ${phoneNumber} for ${quality.consecutive_missed} consecutive missed calls`);
    
    quality.warning_sent = true;
    quality.warning_sent_at = new Date();
    await quality.save();

    // Send warning message to user
    await sendWarningMessage(phoneNumber, quality.consecutive_missed);
  }
}

/**
 * Send warning message to user
 */
async function sendWarningMessage(phoneNumber: string, missedCount: number): Promise<void> {
  try {
    const threshold = process.env.WHATSAPP_ENV === 'sandbox' ? 10 : 4;
    const remaining = threshold - missedCount;

    const message = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'text',
      text: {
        body: `⚠️ Call Quality Warning\n\nWe've noticed you've missed ${missedCount} consecutive calls from us. If you miss ${remaining} more consecutive calls, your call permission will be automatically revoked.\n\nPlease answer our next call or let us know if you'd prefer not to receive calls.`
      }
    };

    await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Warning message sent to ${phoneNumber}`);
  } catch (error: any) {
    console.error('❌ Failed to send warning message:', error.response?.data || error.message);
  }
}

/**
 * Send revocation notification to user
 */
async function sendRevocationNotification(phoneNumber: string, missedCount: number): Promise<void> {
  try {
    const message = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'text',
      text: {
        body: `🚫 Call Permission Revoked\n\nYour call permission has been automatically revoked due to ${missedCount} consecutive missed calls.\n\nIf you'd like to receive calls from us again, please let us know and we'll send a new permission request.`
      }
    };

    await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Revocation notification sent to ${phoneNumber}`);
  } catch (error: any) {
    console.error('❌ Failed to send revocation notification:', error.response?.data || error.message);
  }
}

/**
 * Get quality metrics for a specific phone number
 */
export const getQualityByPhone = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.params;
    const userId = (req as any).user.id;

    const quality = await CallQuality.findOne({
      where: { user_id: userId, phone_number }
    });

    if (!quality) {
      return res.json({
        phone_number,
        total_calls: 0,
        connected_calls: 0,
        missed_calls: 0,
        rejected_calls: 0,
        failed_calls: 0,
        consecutive_missed: 0,
        consecutive_connected: 0,
        pickup_rate: 0,
        quality_status: 'excellent',
        warning_sent: false,
        needs_warning: false,
        needs_revocation: false,
      });
    }

    res.json({
      id: quality.id,
      phone_number: quality.phone_number,
      total_calls: quality.total_calls,
      connected_calls: quality.connected_calls,
      missed_calls: quality.missed_calls,
      rejected_calls: quality.rejected_calls,
      failed_calls: quality.failed_calls,
      consecutive_missed: quality.consecutive_missed,
      consecutive_connected: quality.consecutive_connected,
      pickup_rate: quality.pickup_rate,
      quality_status: quality.getQualityStatus(),
      warning_sent: quality.warning_sent,
      warning_sent_at: quality.warning_sent_at,
      needs_warning: quality.needsWarning(),
      needs_revocation: quality.needsRevocation(),
      last_call_at: quality.last_call_at,
      last_connected_at: quality.last_connected_at,
      last_missed_at: quality.last_missed_at,
    });
  } catch (error: any) {
    console.error('Error getting call quality:', error);
    res.status(500).json({ error: 'Failed to get call quality', details: error.message });
  }
};

/**
 * Get quality metrics for all contacts
 */
export const getAllQuality = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const qualities = await CallQuality.findAll({
      where: { user_id: userId },
      order: [['pickup_rate', 'ASC'], ['total_calls', 'DESC']]
    });

    const qualityData = qualities.map(q => ({
      id: q.id,
      phone_number: q.phone_number,
      total_calls: q.total_calls,
      connected_calls: q.connected_calls,
      missed_calls: q.missed_calls,
      rejected_calls: q.rejected_calls,
      failed_calls: q.failed_calls,
      consecutive_missed: q.consecutive_missed,
      consecutive_connected: q.consecutive_connected,
      pickup_rate: q.pickup_rate,
      quality_status: q.getQualityStatus(),
      warning_sent: q.warning_sent,
      needs_warning: q.needsWarning(),
      needs_revocation: q.needsRevocation(),
      last_call_at: q.last_call_at,
    }));

    // Calculate overall statistics
    const totalCalls = qualities.reduce((sum, q) => sum + q.total_calls, 0);
    const totalConnected = qualities.reduce((sum, q) => sum + q.connected_calls, 0);
    const totalMissed = qualities.reduce((sum, q) => sum + q.missed_calls, 0);
    const overallPickupRate = totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 100) : 0;

    const poorQuality = qualities.filter(q => q.getQualityStatus() === 'poor' || q.getQualityStatus() === 'critical').length;
    const needsAttention = qualities.filter(q => q.needsWarning() || q.needsRevocation()).length;

    res.json({
      qualities: qualityData,
      summary: {
        total_contacts: qualities.length,
        total_calls: totalCalls,
        total_connected: totalConnected,
        total_missed: totalMissed,
        overall_pickup_rate: overallPickupRate,
        poor_quality_count: poorQuality,
        needs_attention_count: needsAttention,
      }
    });
  } catch (error: any) {
    console.error('Error getting all quality metrics:', error);
    res.status(500).json({ error: 'Failed to get quality metrics', details: error.message });
  }
};

/**
 * Get quality dashboard data
 */
export const getQualityDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all quality records
    const qualities = await CallQuality.findAll({
      where: { user_id: userId }
    });

    // Get recent calls (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCalls = await Call.findAll({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics
    const totalCalls = qualities.reduce((sum, q) => sum + q.total_calls, 0);
    const totalConnected = qualities.reduce((sum, q) => sum + q.connected_calls, 0);
    const totalMissed = qualities.reduce((sum, q) => sum + q.missed_calls, 0);
    const overallPickupRate = totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 100) : 0;

    // Quality distribution
    const qualityDistribution = {
      excellent: qualities.filter(q => q.getQualityStatus() === 'excellent').length,
      good: qualities.filter(q => q.getQualityStatus() === 'good').length,
      fair: qualities.filter(q => q.getQualityStatus() === 'fair').length,
      poor: qualities.filter(q => q.getQualityStatus() === 'poor').length,
      critical: qualities.filter(q => q.getQualityStatus() === 'critical').length,
    };

    // Contacts needing attention
    const needsAttention = qualities.filter(q => 
      q.needsWarning() || q.needsRevocation() || q.consecutive_missed >= 2
    ).map(q => ({
      phone_number: q.phone_number,
      consecutive_missed: q.consecutive_missed,
      pickup_rate: q.pickup_rate,
      quality_status: q.getQualityStatus(),
      needs_warning: q.needsWarning(),
      needs_revocation: q.needsRevocation(),
      last_call_at: q.last_call_at,
    }));

    // Top performers
    const topPerformers = qualities
      .filter(q => q.total_calls >= 3) // At least 3 calls
      .sort((a, b) => b.pickup_rate - a.pickup_rate)
      .slice(0, 5)
      .map(q => ({
        phone_number: q.phone_number,
        pickup_rate: q.pickup_rate,
        total_calls: q.total_calls,
        connected_calls: q.connected_calls,
      }));

    // Call trends (last 7 days)
    const callTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCalls = recentCalls.filter(call => {
        const callDate = new Date(call.createdAt);
        return callDate >= date && callDate < nextDate;
      });

      const connected = dayCalls.filter(c => c.status === 'ended' || c.status === 'answered').length;
      const missed = dayCalls.filter(c => c.status === 'missed' || c.status === 'no_answer').length;

      callTrends.push({
        date: date.toISOString().split('T')[0],
        total: dayCalls.length,
        connected,
        missed,
        pickup_rate: dayCalls.length > 0 ? Math.round((connected / dayCalls.length) * 100) : 0,
      });
    }

    res.json({
      summary: {
        total_contacts: qualities.length,
        total_calls: totalCalls,
        total_connected: totalConnected,
        total_missed: totalMissed,
        overall_pickup_rate: overallPickupRate,
      },
      quality_distribution: qualityDistribution,
      needs_attention: needsAttention,
      top_performers: topPerformers,
      call_trends: callTrends,
      recent_calls: recentCalls.slice(0, 10).map(call => ({
        id: call.id,
        from_number: call.from_number,
        to_number: call.to_number,
        status: call.status,
        direction: call.direction,
        created_at: call.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error getting quality dashboard:', error);
    res.status(500).json({ error: 'Failed to get quality dashboard', details: error.message });
  }
};

/**
 * Reset warning for a contact (manual action)
 */
export const resetWarning = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.params;
    const userId = (req as any).user.id;

    const quality = await CallQuality.findOne({
      where: { user_id: userId, phone_number }
    });

    if (!quality) {
      return res.status(404).json({ error: 'Quality record not found' });
    }

    quality.resetWarning();
    quality.consecutive_missed = 0; // Also reset consecutive missed
    await quality.save();

    res.json({
      success: true,
      message: 'Warning reset successfully',
      quality: {
        phone_number: quality.phone_number,
        consecutive_missed: quality.consecutive_missed,
        warning_sent: quality.warning_sent,
      }
    });
  } catch (error: any) {
    console.error('Error resetting warning:', error);
    res.status(500).json({ error: 'Failed to reset warning', details: error.message });
  }
};

export { updateCallQuality as default };
