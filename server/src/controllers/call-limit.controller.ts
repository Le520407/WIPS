import { Request, Response } from 'express';
import CallLimit from '../models/CallLimit';
import { Op } from 'sequelize';

// Get call limit status for a phone number
export const getCallLimit = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.params;
    const userId = (req as any).user.id;

    let callLimit = await CallLimit.findOne({
      where: {
        user_id: userId,
        phone_number,
      },
    });

    // Create if doesn't exist
    if (!callLimit) {
      callLimit = await CallLimit.create({
        user_id: userId,
        phone_number,
        limit_24h: process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10,
      });
    }

    // Reset if needed
    const wasReset = callLimit.resetIfNeeded();
    if (wasReset) {
      await callLimit.save();
    }

    res.json({
      phone_number: callLimit.phone_number,
      calls_24h: callLimit.calls_24h,
      limit_24h: callLimit.limit_24h,
      remaining: callLimit.getRemainingCalls(),
      usage_percentage: callLimit.getUsagePercentage(),
      can_make_call: callLimit.canMakeCall(),
      is_limited: callLimit.is_limited,
      needs_warning: callLimit.needsWarning(),
      time_until_reset_ms: callLimit.getTimeUntilReset(),
      limit_reset_at: callLimit.limit_reset_at,
      last_call_at: callLimit.last_call_at,
      window_start: callLimit.window_start_24h,
    });
  } catch (error) {
    console.error('Error getting call limit:', error);
    res.status(500).json({ error: 'Failed to get call limit' });
  }
};

// Check if can make call (before initiating)
export const checkCallLimit = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.body;
    const userId = (req as any).user.id;

    let callLimit = await CallLimit.findOne({
      where: {
        user_id: userId,
        phone_number,
      },
    });

    // Create if doesn't exist
    if (!callLimit) {
      callLimit = await CallLimit.create({
        user_id: userId,
        phone_number,
        limit_24h: process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10,
      });
    }

    // Reset if needed
    callLimit.resetIfNeeded();
    await callLimit.save();

    const canMakeCall = callLimit.canMakeCall();

    res.json({
      can_make_call: canMakeCall,
      remaining: callLimit.getRemainingCalls(),
      calls_24h: callLimit.calls_24h,
      limit_24h: callLimit.limit_24h,
      usage_percentage: callLimit.getUsagePercentage(),
      time_until_reset_ms: callLimit.getTimeUntilReset(),
      message: canMakeCall
        ? `You can make ${callLimit.getRemainingCalls()} more calls in the next 24 hours`
        : `Call limit reached. Resets in ${Math.ceil(callLimit.getTimeUntilReset() / (1000 * 60))} minutes`,
    });
  } catch (error) {
    console.error('Error checking call limit:', error);
    res.status(500).json({ error: 'Failed to check call limit' });
  }
};

// Record a call (increment counter)
export const recordCall = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.body;
    const userId = (req as any).user.id;

    let callLimit = await CallLimit.findOne({
      where: {
        user_id: userId,
        phone_number,
      },
    });

    // Create if doesn't exist
    if (!callLimit) {
      callLimit = await CallLimit.create({
        user_id: userId,
        phone_number,
        limit_24h: process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10,
        window_start_24h: new Date(),
      });
    }

    // Reset if needed
    callLimit.resetIfNeeded();

    // Check if can make call
    if (!callLimit.canMakeCall()) {
      return res.status(429).json({
        error: 'Call limit reached',
        message: `You have reached your call limit of ${callLimit.limit_24h} calls per 24 hours`,
        limit_reset_at: callLimit.limit_reset_at,
        time_until_reset_ms: callLimit.getTimeUntilReset(),
      });
    }

    // Increment counter
    callLimit.incrementCallCount();
    await callLimit.save();

    res.json({
      success: true,
      message: 'Call recorded',
      calls_24h: callLimit.calls_24h,
      remaining: callLimit.getRemainingCalls(),
      usage_percentage: callLimit.getUsagePercentage(),
      needs_warning: callLimit.needsWarning(),
    });
  } catch (error) {
    console.error('Error recording call:', error);
    res.status(500).json({ error: 'Failed to record call' });
  }
};

// Get all call limits for user
export const getAllCallLimits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const callLimits = await CallLimit.findAll({
      where: {
        user_id: userId,
      },
      order: [['last_call_at', 'DESC']],
    });

    // Reset if needed for each
    for (const limit of callLimits) {
      const wasReset = limit.resetIfNeeded();
      if (wasReset) {
        await limit.save();
      }
    }

    const limitsData = callLimits.map((limit) => ({
      phone_number: limit.phone_number,
      calls_24h: limit.calls_24h,
      limit_24h: limit.limit_24h,
      remaining: limit.getRemainingCalls(),
      usage_percentage: limit.getUsagePercentage(),
      can_make_call: limit.canMakeCall(),
      is_limited: limit.is_limited,
      needs_warning: limit.needsWarning(),
      time_until_reset_ms: limit.getTimeUntilReset(),
      last_call_at: limit.last_call_at,
    }));

    res.json({
      limits: limitsData,
      total_contacts: limitsData.length,
      limited_contacts: limitsData.filter((l) => l.is_limited).length,
      warning_contacts: limitsData.filter((l) => l.needs_warning).length,
    });
  } catch (error) {
    console.error('Error getting all call limits:', error);
    res.status(500).json({ error: 'Failed to get call limits' });
  }
};

// Get call limit dashboard
export const getCallLimitDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const callLimits = await CallLimit.findAll({
      where: {
        user_id: userId,
      },
    });

    // Reset if needed
    for (const limit of callLimits) {
      const wasReset = limit.resetIfNeeded();
      if (wasReset) {
        await limit.save();
      }
    }

    // Calculate statistics
    const totalContacts = callLimits.length;
    const limitedContacts = callLimits.filter((l) => l.is_limited).length;
    const warningContacts = callLimits.filter((l) => l.needsWarning() && !l.is_limited).length;
    const activeContacts = callLimits.filter((l) => l.canMakeCall()).length;

    const totalCalls24h = callLimits.reduce((sum, l) => sum + l.calls_24h, 0);
    const totalLimit = callLimits.reduce((sum, l) => sum + l.limit_24h, 0);
    const averageUsage = totalContacts > 0 ? Math.round((totalCalls24h / totalLimit) * 100) : 0;

    // Get contacts needing attention (limited or warning)
    const needsAttention = callLimits
      .filter((l) => l.is_limited || l.needsWarning())
      .sort((a, b) => b.getUsagePercentage() - a.getUsagePercentage())
      .slice(0, 10)
      .map((limit) => ({
        phone_number: limit.phone_number,
        calls_24h: limit.calls_24h,
        limit_24h: limit.limit_24h,
        remaining: limit.getRemainingCalls(),
        usage_percentage: limit.getUsagePercentage(),
        is_limited: limit.is_limited,
        time_until_reset_ms: limit.getTimeUntilReset(),
        last_call_at: limit.last_call_at,
      }));

    // Get most active contacts
    const mostActive = callLimits
      .filter((l) => l.calls_24h > 0)
      .sort((a, b) => b.calls_24h - a.calls_24h)
      .slice(0, 10)
      .map((limit) => ({
        phone_number: limit.phone_number,
        calls_24h: limit.calls_24h,
        limit_24h: limit.limit_24h,
        usage_percentage: limit.getUsagePercentage(),
        last_call_at: limit.last_call_at,
      }));

    res.json({
      summary: {
        total_contacts: totalContacts,
        active_contacts: activeContacts,
        limited_contacts: limitedContacts,
        warning_contacts: warningContacts,
        total_calls_24h: totalCalls24h,
        total_limit: totalLimit,
        average_usage_percentage: averageUsage,
      },
      needs_attention: needsAttention,
      most_active: mostActive,
      environment: process.env.WHATSAPP_ENV || 'production',
      default_limit: process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10,
    });
  } catch (error) {
    console.error('Error getting call limit dashboard:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
};

// Update call limit for a contact (admin function)
export const updateCallLimit = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.params;
    const { limit_24h } = req.body;
    const userId = (req as any).user.id;

    if (!limit_24h || limit_24h < 1) {
      return res.status(400).json({ error: 'Invalid limit value' });
    }

    let callLimit = await CallLimit.findOne({
      where: {
        user_id: userId,
        phone_number,
      },
    });

    if (!callLimit) {
      callLimit = await CallLimit.create({
        user_id: userId,
        phone_number,
        limit_24h,
      });
    } else {
      callLimit.limit_24h = limit_24h;
      
      // Re-check if limited
      if (callLimit.calls_24h < limit_24h) {
        callLimit.is_limited = false;
        callLimit.limit_reset_at = undefined;
      }
      
      await callLimit.save();
    }

    res.json({
      success: true,
      message: 'Call limit updated',
      phone_number: callLimit.phone_number,
      limit_24h: callLimit.limit_24h,
      calls_24h: callLimit.calls_24h,
      remaining: callLimit.getRemainingCalls(),
      can_make_call: callLimit.canMakeCall(),
    });
  } catch (error) {
    console.error('Error updating call limit:', error);
    res.status(500).json({ error: 'Failed to update call limit' });
  }
};
