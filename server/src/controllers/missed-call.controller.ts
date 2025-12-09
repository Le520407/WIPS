import { Request, Response } from 'express';
import Call from '../models/Call';
import { Op } from 'sequelize';
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Get all missed calls
 */
export const getMissedCalls = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { unread_only, limit = 50 } = req.query;

    const where: any = {
      user_id: userId,
      type: 'incoming',
      status: 'missed'
    };

    // Filter for unread only
    if (unread_only === 'true') {
      where.callback_sent = false;
      where.callback_completed = false;
    }

    const missedCalls = await Call.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string)
    });

    // Group by phone number
    const groupedByPhone: { [key: string]: any[] } = {};
    missedCalls.forEach(call => {
      const phone = call.from_number;
      if (!groupedByPhone[phone]) {
        groupedByPhone[phone] = [];
      }
      groupedByPhone[phone].push({
        id: call.id,
        call_id: call.call_id,
        from_number: call.from_number,
        to_number: call.to_number,
        status: call.status,
        start_time: call.start_time,
        callback_sent: call.callback_sent,
        callback_completed: call.callback_completed,
        created_at: call.createdAt,
      });
    });

    // Calculate statistics
    const totalMissed = missedCalls.length;
    const uniqueContacts = Object.keys(groupedByPhone).length;
    const needsCallback = missedCalls.filter(c => !c.callback_sent && !c.callback_completed).length;

    res.json({
      missed_calls: missedCalls.map(call => ({
        id: call.id,
        call_id: call.call_id,
        from_number: call.from_number,
        to_number: call.to_number,
        status: call.status,
        start_time: call.start_time,
        callback_sent: call.callback_sent,
        callback_completed: call.callback_completed,
        created_at: call.createdAt,
      })),
      grouped_by_phone: groupedByPhone,
      statistics: {
        total_missed: totalMissed,
        unique_contacts: uniqueContacts,
        needs_callback: needsCallback,
      }
    });
  } catch (error: any) {
    console.error('Error getting missed calls:', error);
    res.status(500).json({ error: 'Failed to get missed calls', details: error.message });
  }
};

/**
 * Get missed calls count (for badge)
 */
export const getMissedCallsCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = await Call.count({
      where: {
        user_id: userId,
        type: 'incoming',
        status: 'missed',
        callback_sent: false,
        callback_completed: false,
      }
    });

    res.json({ count });
  } catch (error: any) {
    console.error('Error getting missed calls count:', error);
    res.status(500).json({ error: 'Failed to get count', details: error.message });
  }
};

/**
 * Initiate callback for a missed call
 */
export const initiateCallback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { call_id } = req.params;

    // Find the missed call
    const missedCall = await Call.findOne({
      where: {
        id: call_id,
        user_id: userId,
        type: 'incoming',
        status: 'missed'
      }
    });

    if (!missedCall) {
      return res.status(404).json({ error: 'Missed call not found' });
    }

    // Check if already called back
    if (missedCall.callback_completed) {
      return res.status(400).json({ error: 'Callback already completed' });
    }

    // Initiate the callback call
    const callPayload = {
      messaging_product: 'whatsapp',
      to: missedCall.from_number,
      type: 'call',
    };

    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        callPayload,
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Mark as callback sent
      missedCall.callback_sent = true;
      missedCall.callback_sent_at = new Date();
      await missedCall.save();

      console.log('✅ Callback initiated for:', missedCall.from_number);

      res.json({
        success: true,
        message: 'Callback initiated successfully',
        call_id: response.data.messages[0].id,
        to: missedCall.from_number,
      });
    } catch (apiError: any) {
      console.error('❌ Failed to initiate callback:', apiError.response?.data || apiError.message);
      res.status(500).json({
        error: 'Failed to initiate callback',
        details: apiError.response?.data || apiError.message
      });
    }
  } catch (error: any) {
    console.error('Error initiating callback:', error);
    res.status(500).json({ error: 'Failed to initiate callback', details: error.message });
  }
};

/**
 * Send message to missed call contact
 */
export const sendMissedCallMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { call_id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find the missed call
    const missedCall = await Call.findOne({
      where: {
        id: call_id,
        user_id: userId,
        type: 'incoming',
        status: 'missed'
      }
    });

    if (!missedCall) {
      return res.status(404).json({ error: 'Missed call not found' });
    }

    // Send the message
    const messagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: missedCall.from_number,
      type: 'text',
      text: {
        body: message
      }
    };

    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        messagePayload,
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Mark as callback sent (message sent)
      missedCall.callback_sent = true;
      missedCall.callback_sent_at = new Date();
      await missedCall.save();

      console.log('✅ Message sent to:', missedCall.from_number);

      res.json({
        success: true,
        message: 'Message sent successfully',
        message_id: response.data.messages[0].id,
        to: missedCall.from_number,
      });
    } catch (apiError: any) {
      console.error('❌ Failed to send message:', apiError.response?.data || apiError.message);
      res.status(500).json({
        error: 'Failed to send message',
        details: apiError.response?.data || apiError.message
      });
    }
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};

/**
 * Mark missed call as handled
 */
export const markAsHandled = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { call_id } = req.params;

    const missedCall = await Call.findOne({
      where: {
        id: call_id,
        user_id: userId,
        type: 'incoming',
        status: 'missed'
      }
    });

    if (!missedCall) {
      return res.status(404).json({ error: 'Missed call not found' });
    }

    missedCall.callback_completed = true;
    missedCall.callback_completed_at = new Date();
    await missedCall.save();

    res.json({
      success: true,
      message: 'Marked as handled',
      call: {
        id: missedCall.id,
        from_number: missedCall.from_number,
        callback_completed: missedCall.callback_completed,
      }
    });
  } catch (error: any) {
    console.error('Error marking as handled:', error);
    res.status(500).json({ error: 'Failed to mark as handled', details: error.message });
  }
};

/**
 * Bulk mark as handled
 */
export const bulkMarkAsHandled = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { call_ids } = req.body;

    if (!Array.isArray(call_ids) || call_ids.length === 0) {
      return res.status(400).json({ error: 'call_ids array is required' });
    }

    const updated = await Call.update(
      {
        callback_completed: true,
        callback_completed_at: new Date(),
      },
      {
        where: {
          id: { [Op.in]: call_ids },
          user_id: userId,
          type: 'incoming',
          status: 'missed'
        }
      }
    );

    res.json({
      success: true,
      message: `${updated[0]} calls marked as handled`,
      count: updated[0],
    });
  } catch (error: any) {
    console.error('Error bulk marking as handled:', error);
    res.status(500).json({ error: 'Failed to bulk mark as handled', details: error.message });
  }
};

/**
 * Get missed calls by phone number
 */
export const getMissedCallsByPhone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { phone_number } = req.params;

    const missedCalls = await Call.findAll({
      where: {
        user_id: userId,
        from_number: phone_number,
        type: 'incoming',
        status: 'missed'
      },
      order: [['createdAt', 'DESC']]
    });

    const needsCallback = missedCalls.filter(c => !c.callback_sent && !c.callback_completed).length;

    res.json({
      phone_number,
      missed_calls: missedCalls.map(call => ({
        id: call.id,
        call_id: call.call_id,
        status: call.status,
        start_time: call.start_time,
        callback_sent: call.callback_sent,
        callback_completed: call.callback_completed,
        created_at: call.createdAt,
      })),
      statistics: {
        total: missedCalls.length,
        needs_callback: needsCallback,
      }
    });
  } catch (error: any) {
    console.error('Error getting missed calls by phone:', error);
    res.status(500).json({ error: 'Failed to get missed calls', details: error.message });
  }
};
