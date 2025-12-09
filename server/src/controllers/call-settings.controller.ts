import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import CallSettings from '../models/CallSettings';
import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Get call settings for the user
export const getCallSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await CallSettings.findOne({
      where: { user_id: req.user!.id },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await CallSettings.create({
        user_id: req.user!.id,
        calling_enabled: false,
        inbound_enabled: true,
        outbound_enabled: true,
        callback_enabled: true,
        business_hours: {
          enabled: false,
          timezone: 'UTC',
          schedule: {
            monday: { enabled: true, periods: [{ start: '09:00', end: '17:00' }] },
            tuesday: { enabled: true, periods: [{ start: '09:00', end: '17:00' }] },
            wednesday: { enabled: true, periods: [{ start: '09:00', end: '17:00' }] },
            thursday: { enabled: true, periods: [{ start: '09:00', end: '17:00' }] },
            friday: { enabled: true, periods: [{ start: '09:00', end: '17:00' }] },
            saturday: { enabled: false, periods: [] },
            sunday: { enabled: false, periods: [] },
          },
        },
        auto_reply_message: 'Thank you for calling. We are currently unavailable. Please leave a message or try again during business hours.',
      });
    }

    res.json({ settings: settings.toJSON() });
  } catch (error) {
    console.error('Get call settings error:', error);
    res.status(500).json({ error: 'Failed to fetch call settings' });
  }
};

// Helper function to convert our format to Meta API format
const convertToMetaFormat = (settings: any) => {
  const metaSettings: any = {
    calling: {
      status: settings.calling_enabled ? 'ENABLED' : 'DISABLED',
      call_icon_visibility: 'DEFAULT',
      callback_permission_status: settings.callback_enabled ? 'ENABLED' : 'DISABLED',
    },
  };

  // Add business hours if enabled
  if (settings.business_hours && settings.business_hours.enabled) {
    const weeklyHours: any[] = [];
    const daysMap: { [key: string]: string } = {
      monday: 'MONDAY',
      tuesday: 'TUESDAY',
      wednesday: 'WEDNESDAY',
      thursday: 'THURSDAY',
      friday: 'FRIDAY',
      saturday: 'SATURDAY',
      sunday: 'SUNDAY',
    };

    Object.entries(settings.business_hours.schedule).forEach(([day, schedule]: [string, any]) => {
      if (schedule.enabled && schedule.periods && schedule.periods.length > 0) {
        schedule.periods.forEach((period: any) => {
          weeklyHours.push({
            day_of_week: daysMap[day],
            open_time: period.start.replace(':', ''),
            close_time: period.end.replace(':', ''),
          });
        });
      }
    });

    metaSettings.calling.call_hours = {
      status: 'ENABLED',
      timezone_id: settings.business_hours.timezone || 'UTC',
      weekly_operating_hours: weeklyHours,
    };
  }

  return metaSettings;
};

// Update call settings
export const updateCallSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      calling_enabled,
      inbound_enabled,
      outbound_enabled,
      callback_enabled,
      business_hours,
      auto_reply_message,
    } = req.body;

    let settings = await CallSettings.findOne({
      where: { user_id: req.user!.id },
    });

    if (!settings) {
      // Create new settings
      settings = await CallSettings.create({
        user_id: req.user!.id,
        calling_enabled: calling_enabled ?? false,
        inbound_enabled: inbound_enabled ?? true,
        outbound_enabled: outbound_enabled ?? true,
        callback_enabled: callback_enabled ?? true,
        business_hours: business_hours ?? null,
        auto_reply_message: auto_reply_message ?? null,
      });
    } else {
      // Update existing settings
      await settings.update({
        calling_enabled: calling_enabled ?? settings.calling_enabled,
        inbound_enabled: inbound_enabled ?? settings.inbound_enabled,
        outbound_enabled: outbound_enabled ?? settings.outbound_enabled,
        callback_enabled: callback_enabled ?? settings.callback_enabled,
        business_hours: business_hours ?? settings.business_hours,
        auto_reply_message: auto_reply_message ?? settings.auto_reply_message,
      });
    }

    // Sync to Meta/WhatsApp API
    try {
      const metaSettings = convertToMetaFormat(settings.toJSON());
      
      console.log('Syncing call settings to Meta API:', JSON.stringify(metaSettings, null, 2));
      
      const response = await axios.post(
        `${WHATSAPP_API_URL}/v21.0/${PHONE_NUMBER_ID}/settings`,
        metaSettings,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Meta API response:', response.data);

      res.json({
        success: true,
        settings: settings.toJSON(),
        meta_sync: {
          success: true,
          message: 'Settings synced to WhatsApp. Changes may take up to 7 days to appear in WhatsApp clients.',
        },
      });
    } catch (metaError: any) {
      console.error('Meta API sync error:', metaError.response?.data || metaError.message);
      
      // Still return success for local save, but indicate sync failure
      res.json({
        success: true,
        settings: settings.toJSON(),
        meta_sync: {
          success: false,
          error: metaError.response?.data || metaError.message,
          message: 'Settings saved locally but failed to sync to WhatsApp',
        },
      });
    }
  } catch (error) {
    console.error('Update call settings error:', error);
    res.status(500).json({ error: 'Failed to update call settings' });
  }
};

// Check if calling is currently allowed based on business hours
export const checkCallingAllowed = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await CallSettings.findOne({
      where: { user_id: req.user!.id },
    });

    if (!settings) {
      return res.json({
        allowed: false,
        reason: 'Settings not configured',
      });
    }

    // Check if calling is enabled
    if (!settings.calling_enabled) {
      return res.json({
        allowed: false,
        reason: 'Calling is disabled',
      });
    }

    // Check business hours if enabled
    if (settings.business_hours && settings.business_hours.enabled) {
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

      const daySchedule = settings.business_hours.schedule[dayOfWeek];

      if (!daySchedule || !daySchedule.enabled) {
        return res.json({
          allowed: false,
          reason: 'Outside business hours (day closed)',
          auto_reply_message: settings.auto_reply_message,
        });
      }

      // Check if current time is within any period
      const isWithinPeriod = daySchedule.periods.some(period => {
        return currentTime >= period.start && currentTime <= period.end;
      });

      if (!isWithinPeriod) {
        return res.json({
          allowed: false,
          reason: 'Outside business hours',
          auto_reply_message: settings.auto_reply_message,
        });
      }
    }

    res.json({
      allowed: true,
      reason: 'Calling is allowed',
    });
  } catch (error) {
    console.error('Check calling allowed error:', error);
    res.status(500).json({ error: 'Failed to check calling status' });
  }
};

// Get business hours status
export const getBusinessHoursStatus = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await CallSettings.findOne({
      where: { user_id: req.user!.id },
    });

    if (!settings || !settings.business_hours || !settings.business_hours.enabled) {
      return res.json({
        enabled: false,
        is_open: true,
        message: 'Business hours not configured',
      });
    }

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    const daySchedule = settings.business_hours.schedule[dayOfWeek];

    if (!daySchedule || !daySchedule.enabled) {
      return res.json({
        enabled: true,
        is_open: false,
        message: 'Closed today',
        auto_reply_message: settings.auto_reply_message,
      });
    }

    const isWithinPeriod = daySchedule.periods.some(period => {
      return currentTime >= period.start && currentTime <= period.end;
    });

    res.json({
      enabled: true,
      is_open: isWithinPeriod,
      message: isWithinPeriod ? 'Open now' : 'Closed',
      current_day: dayOfWeek,
      current_time: currentTime,
      today_schedule: daySchedule,
      auto_reply_message: settings.auto_reply_message,
    });
  } catch (error) {
    console.error('Get business hours status error:', error);
    res.status(500).json({ error: 'Failed to get business hours status' });
  }
};
