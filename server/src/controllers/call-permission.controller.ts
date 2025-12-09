import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import CallPermission from '../models/CallPermission';
import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Get permission status for a phone number
export const getPermissionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const phone_number = req.params.phone_number as string;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Get from database
    let permission = await CallPermission.findOne({
      where: {
        user_id: req.user!.id,
        phone_number: phone_number,
      },
    });

    // If not found, create default record
    if (!permission) {
      permission = await CallPermission.create({
        user_id: req.user!.id,
        phone_number,
        status: 'no_permission',
      });
    }

    // Check if expired
    if (permission.isExpired() && permission.status !== 'no_permission') {
      permission.status = 'no_permission';
      permission.expires_at = null;
      await permission.save();
    }

    // Also fetch from Meta API for real-time status
    try {
      const metaResponse = await axios.get(
        `${WHATSAPP_API_URL}/v21.0/${PHONE_NUMBER_ID}/call_permissions`,
        {
          params: {
            user_wa_id: phone_number,
          },
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      );

      res.json({
        permission: permission.toJSON(),
        meta_status: metaResponse.data,
        can_request: permission.canRequestPermission(),
        can_call: permission.canMakeCall(),
      });
    } catch (metaError: any) {
      // If Meta API fails, still return local data
      console.error('Meta API error:', metaError.response?.data || metaError.message);
      res.json({
        permission: permission.toJSON(),
        meta_status: null,
        can_request: permission.canRequestPermission(),
        can_call: permission.canMakeCall(),
      });
    }
  } catch (error) {
    console.error('Get permission status error:', error);
    res.status(500).json({ error: 'Failed to get permission status' });
  }
};

// Request call permission from user
export const requestPermission = async (req: AuthRequest, res: Response) => {
  try {
    const phone_number = req.body.phone_number as string;
    const message_body = req.body.message_body as string | undefined;
    const use_template = req.body.use_template as boolean | undefined;
    const template_name = req.body.template_name as string | undefined;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Get or create permission record
    let permission = await CallPermission.findOne({
      where: {
        user_id: req.user!.id,
        phone_number: phone_number,
      },
    });

    if (!permission) {
      permission = await CallPermission.create({
        user_id: req.user!.id,
        phone_number,
        status: 'no_permission',
      });
    }

    // Check if can request
    if (!permission.canRequestPermission()) {
      return res.status(429).json({
        error: 'Permission request limit reached',
        details: {
          request_count_24h: permission.request_count_24h,
          request_count_7d: permission.request_count_7d,
          last_request_at: permission.last_request_at,
        },
      });
    }

    // Send permission request via Meta API
    try {
      let messagePayload: any;

      if (use_template && template_name) {
        // Send template message
        messagePayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone_number,
          type: 'template',
          template: {
            name: template_name,
            language: {
              code: 'en',
            },
          },
        };
      } else {
        // Send free-form interactive message
        messagePayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone_number,
          type: 'interactive',
          interactive: {
            type: 'call_permission_request',
            action: {
              name: 'call_permission_request',
            },
          },
        };

        // Add body if provided
        if (message_body) {
          messagePayload.interactive.body = {
            text: message_body,
          };
        }
      }

      const response = await axios.post(
        `${WHATSAPP_API_URL}/v21.0/${PHONE_NUMBER_ID}/messages`,
        messagePayload,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update permission record
      const now = new Date();
      permission.status = 'pending';
      permission.requested_at = now;
      permission.last_request_at = now;
      permission.request_count_24h += 1;
      permission.request_count_7d += 1;
      permission.permission_message_id = response.data.messages[0].id;
      await permission.save();

      res.json({
        success: true,
        message: 'Permission request sent successfully',
        message_id: response.data.messages[0].id,
        permission: permission.toJSON(),
      });
    } catch (metaError: any) {
      console.error('Meta API error:', metaError.response?.data || metaError.message);
      res.status(500).json({
        error: 'Failed to send permission request',
        details: metaError.response?.data || metaError.message,
      });
    }
  } catch (error) {
    console.error('Request permission error:', error);
    res.status(500).json({ error: 'Failed to request permission' });
  }
};

// List all permissions for the user
export const listPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await CallPermission.findAll({
      where: { user_id: req.user!.id },
      order: [['updated_at', 'DESC']],
    });

    // Check for expired permissions
    const now = new Date();
    for (const permission of permissions) {
      if (permission.isExpired() && permission.status !== 'no_permission') {
        permission.status = 'no_permission';
        permission.expires_at = null;
        await permission.save();
      }
    }

    res.json({
      permissions: permissions.map((p) => ({
        ...p.toJSON(),
        can_request: p.canRequestPermission(),
        can_call: p.canMakeCall(),
        is_expired: p.isExpired(),
      })),
    });
  } catch (error) {
    console.error('List permissions error:', error);
    res.status(500).json({ error: 'Failed to list permissions' });
  }
};

// Handle permission response webhook (called by webhook.service.ts)
export const handlePermissionResponse = async (
  userId: string,
  phoneNumber: string,
  response: 'accept' | 'reject',
  isPermanent: boolean,
  expirationTimestamp: number | null,
  responseSource: 'user_action' | 'automatic',
  contextId: string
) => {
  try {
    let permission = await CallPermission.findOne({
      where: {
        user_id: userId,
        phone_number: phoneNumber,
      },
    });

    if (!permission) {
      permission = await CallPermission.create({
        user_id: userId,
        phone_number: phoneNumber,
        status: 'no_permission',
      });
    }

    const now = new Date();

    if (response === 'accept') {
      permission.status = isPermanent ? 'permanent' : 'temporary';
      permission.is_permanent = isPermanent;
      permission.approved_at = now;
      permission.response_source = responseSource;

      if (expirationTimestamp && !isPermanent) {
        permission.expires_at = new Date(expirationTimestamp * 1000);
      } else {
        permission.expires_at = null;
      }

      // Reset consecutive missed calls
      permission.consecutive_missed = 0;
      permission.warning_sent = false;
    } else {
      permission.status = 'rejected';
      permission.rejected_at = now;
      permission.response_source = responseSource;
    }

    await permission.save();

    console.log(`Permission ${response}ed for ${phoneNumber}:`, {
      status: permission.status,
      is_permanent: permission.is_permanent,
      expires_at: permission.expires_at,
    });

    return permission;
  } catch (error) {
    console.error('Handle permission response error:', error);
    throw error;
  }
};

// Handle permission revocation
export const handlePermissionRevocation = async (userId: string, phoneNumber: string) => {
  try {
    const permission = await CallPermission.findOne({
      where: {
        user_id: userId,
        phone_number: phoneNumber,
      },
    });

    if (permission) {
      permission.status = 'revoked';
      permission.revoked_at = new Date();
      permission.expires_at = null;
      await permission.save();

      console.log(`Permission revoked for ${phoneNumber}`);
    }

    return permission;
  } catch (error) {
    console.error('Handle permission revocation error:', error);
    throw error;
  }
};

// Update call statistics (called after each call)
export const updateCallStatistics = async (
  userId: string,
  phoneNumber: string,
  callStatus: 'connected' | 'missed' | 'rejected'
) => {
  try {
    const permission = await CallPermission.findOne({
      where: {
        user_id: userId,
        phone_number: phoneNumber,
      },
    });

    if (!permission) return;

    const now = new Date();
    permission.last_call_at = now;

    if (callStatus === 'connected') {
      permission.connected_calls_24h += 1;
      permission.consecutive_missed = 0;
      permission.warning_sent = false;

      // Reset request counts after a connected call
      permission.resetRequestCounts();
    } else if (callStatus === 'missed' || callStatus === 'rejected') {
      permission.consecutive_missed += 1;

      // Check for warnings and auto-revocation
      if (permission.consecutive_missed >= 2 && !permission.warning_sent) {
        permission.warning_sent = true;
        // TODO: Send warning message to user
        console.log(`Warning: 2 consecutive missed calls for ${phoneNumber}`);
      }

      if (permission.consecutive_missed >= 4) {
        permission.status = 'revoked';
        permission.revoked_at = now;
        permission.expires_at = null;
        // TODO: Send revocation notification
        console.log(`Auto-revoked permission for ${phoneNumber} due to 4 consecutive missed calls`);
      }
    }

    await permission.save();
    return permission;
  } catch (error) {
    console.error('Update call statistics error:', error);
    throw error;
  }
};

// Reset counters (run as cron job)
export const resetExpiredCounters = async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Reset 24h counters
    await CallPermission.update(
      {
        request_count_24h: 0,
        connected_calls_24h: 0,
      },
      {
        where: {
          last_request_at: {
            $lt: twentyFourHoursAgo,
          },
        },
      }
    );

    // Reset 7d counters
    await CallPermission.update(
      {
        request_count_7d: 0,
      },
      {
        where: {
          last_request_at: {
            $lt: sevenDaysAgo,
          },
        },
      }
    );

    console.log('Reset expired counters successfully');
  } catch (error) {
    console.error('Reset expired counters error:', error);
  }
};
