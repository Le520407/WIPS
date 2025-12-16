import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Call from '../models/Call';
import axios from 'axios';
import { Op } from 'sequelize';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Get all calls for the user
export const getCalls = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    const whereClause: any = { user_id: req.user!.id };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const calls = await Call.findAll({
      where: whereClause,
      order: [['start_time', 'DESC']],
      limit: parseInt(limit as string),
    });
    
    res.json({ calls: calls.map(c => c.toJSON()) });
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
};

// Get a specific call
export const getCall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const call = await Call.findOne({
      where: {
        id,
        user_id: req.user!.id,
      },
    });
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }
    
    res.json({ call: call.toJSON() });
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
};

// Initiate an outgoing call
export const initiateCall = async (req: AuthRequest, res: Response) => {
  try {
    const { to, context, session, biz_opaque_callback_data } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient number is required' });
    }
    
    // Normalize phone number - ensure it has country code but no + sign
    let normalizedPhone = to.trim();
    
    // Remove + if present
    if (normalizedPhone.startsWith('+')) {
      normalizedPhone = normalizedPhone.substring(1);
    }
    
    // Remove any spaces, dashes, or parentheses
    normalizedPhone = normalizedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Validate it's only digits
    if (!/^\d+$/.test(normalizedPhone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format. Use digits only with country code (e.g., 60105520735)' 
      });
    }
    
    console.log('📞 Initiating call to:', normalizedPhone);
    
    // Prepare API payload
    const payload: any = {
      messaging_product: 'whatsapp',
      to: normalizedPhone,
      action: 'connect',
    };
    
    // Add WebRTC session if provided (for full WebRTC integration)
    if (session && session.sdp && session.sdp_type) {
      payload.session = {
        sdp_type: session.sdp_type,
        sdp: session.sdp,
      };
      console.log('📡 Including WebRTC SDP in call initiation');
    }
    
    // Add tracking data if provided
    if (biz_opaque_callback_data) {
      payload.biz_opaque_callback_data = biz_opaque_callback_data.substring(0, 512);
    }
    
    // Call WhatsApp API to initiate call
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Call initiated:', response.data);
    
    // Extract call ID from response
    const callId = response.data.calls?.[0]?.id || response.data.id || `call_${Date.now()}`;
    
    // Save call record
    const call = await Call.create({
      user_id: req.user!.id,
      call_id: callId,
      from_number: PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      type: 'outgoing',
      status: 'ringing',
      start_time: new Date(),
      context: context || biz_opaque_callback_data,
    });
    
    res.json({
      success: true,
      message: 'Call initiated successfully',
      call_id: callId,
      call: call.toJSON(),
      whatsappResponse: response.data,
    });
  } catch (error: any) {
    console.error('Initiate call error:', error.response?.data || error);
    
    // Handle specific errors
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to initiate call';
    const errorCode = error.response?.data?.error?.code;
    
    // Check for permission errors
    if (errorCode === 131047 || errorMessage.includes('permission')) {
      return res.status(403).json({
        error: 'Permission required',
        message: 'You need to request and obtain call permission from this user first',
        code: errorCode,
        details: error.response?.data,
      });
    }
    
    // Check for limit errors
    if (errorCode === 131053 || errorMessage.includes('limit')) {
      return res.status(429).json({
        error: 'Call limit reached',
        message: 'You have reached the call limit for this user',
        code: errorCode,
        details: error.response?.data,
      });
    }
    
    res.status(500).json({
      error: errorMessage,
      code: errorCode,
      details: error.response?.data,
    });
  }
};

// Get call statistics
export const getCallStats = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause: any = { user_id: req.user!.id };
    
    if (startDate && endDate) {
      whereClause.start_time = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }
    
    // Get all calls
    const allCalls = await Call.findAll({ where: whereClause });
    
    // Calculate statistics
    const stats = {
      total: allCalls.length,
      incoming: allCalls.filter(c => c.type === 'incoming').length,
      outgoing: allCalls.filter(c => c.type === 'outgoing').length,
      connected: allCalls.filter(c => c.status === 'connected' || c.status === 'ended').length,
      missed: allCalls.filter(c => c.status === 'missed').length,
      rejected: allCalls.filter(c => c.status === 'rejected').length,
      failed: allCalls.filter(c => c.status === 'failed').length,
      totalDuration: allCalls.reduce((sum, c) => sum + (c.duration || 0), 0),
      averageDuration: 0,
    };
    
    const connectedCalls = allCalls.filter(c => c.duration && c.duration > 0);
    if (connectedCalls.length > 0) {
      stats.averageDuration = Math.round(
        connectedCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / connectedCalls.length
      );
    }
    
    res.json({ stats });
  } catch (error) {
    console.error('Get call stats error:', error);
    res.status(500).json({ error: 'Failed to fetch call statistics' });
  }
};

// Update call status (internal use, called by webhook)
export const updateCallStatus = async (
  callId: string,
  status: 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed',
  endTime?: Date,
  duration?: number
) => {
  try {
    const call = await Call.findOne({ where: { call_id: callId } });
    
    if (!call) {
      console.log('⚠️  Call not found for update:', callId);
      return null;
    }
    
    await call.update({
      status,
      end_time: endTime,
      duration,
    });
    
    console.log(`✅ Call status updated: ${callId} -> ${status}`);
    return call;
  } catch (error) {
    console.error('Update call status error:', error);
    return null;
  }
};


// Accept an incoming call
export const acceptCall = async (req: AuthRequest, res: Response) => {
  try {
    const { call_id, session, biz_opaque_callback_data } = req.body;
    
    if (!call_id) {
      return res.status(400).json({ error: 'Call ID is required' });
    }
    
    console.log('✅ Accepting call:', call_id);
    
    // Prepare API payload
    const payload: any = {
      messaging_product: 'whatsapp',
      call_id: call_id,  // Include call_id in the body
      action: 'accept',
    };
    
    // Add WebRTC session if provided
    if (session && session.sdp && session.sdp_type) {
      payload.session = {
        sdp_type: session.sdp_type,
        sdp: session.sdp,
      };
    }
    
    // Add tracking data if provided
    if (biz_opaque_callback_data) {
      payload.biz_opaque_callback_data = biz_opaque_callback_data.substring(0, 512);
    }
    
    // Call WhatsApp API to accept call
    // Note: Use /calls endpoint, not /calls/{call_id}
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Call accepted:', response.data);
    
    // Update call status
    await updateCallStatus(call_id, 'connected');
    
    res.json({
      success: true,
      message: 'Call accepted successfully',
      call_id,
      whatsappResponse: response.data,
    });
  } catch (error: any) {
    console.error('Accept call error:', error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to accept call',
      details: error.response?.data,
    });
  }
};

// Reject an incoming call
export const rejectCall = async (req: AuthRequest, res: Response) => {
  try {
    const { call_id } = req.body;
    
    if (!call_id) {
      return res.status(400).json({ error: 'Call ID is required' });
    }
    
    console.log('❌ Rejecting call:', call_id);
    
    // Call WhatsApp API to reject call
    // Note: Use /calls endpoint with call_id in body, not in URL
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      {
        messaging_product: 'whatsapp',
        call_id: call_id,  // Include call_id in the body
        action: 'reject',
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Call rejected:', response.data);
    
    // Update call status
    await updateCallStatus(call_id, 'rejected', new Date());
    
    res.json({
      success: true,
      message: 'Call rejected successfully',
      call_id,
      whatsappResponse: response.data,
    });
  } catch (error: any) {
    console.error('Reject call error:', error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to reject call',
      details: error.response?.data,
    });
  }
};

// Terminate an active call
export const terminateCall = async (req: AuthRequest, res: Response) => {
  try {
    const { call_id } = req.body;
    
    if (!call_id) {
      return res.status(400).json({ error: 'Call ID is required' });
    }
    
    console.log('🔚 Terminating call:', call_id);
    
    // Call WhatsApp API to terminate call
    // Note: Use /calls endpoint with call_id in body, not in URL
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      {
        messaging_product: 'whatsapp',
        call_id: call_id,  // Include call_id in the body
        action: 'terminate',
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Call terminated:', response.data);
    
    // Update call status
    await updateCallStatus(call_id, 'ended', new Date());
    
    res.json({
      success: true,
      message: 'Call terminated successfully',
      call_id,
      whatsappResponse: response.data,
    });
  } catch (error: any) {
    console.error('Terminate call error:', error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to terminate call',
      details: error.response?.data,
    });
  }
};

// Pre-accept a call (for faster connection)
export const preAcceptCall = async (req: AuthRequest, res: Response) => {
  try {
    const { call_id } = req.body;
    
    if (!call_id) {
      return res.status(400).json({ error: 'Call ID is required' });
    }
    
    console.log('⚡ Pre-accepting call:', call_id);
    
    // Call WhatsApp API to pre-accept call
    // Note: Use /calls endpoint with call_id in body, not in URL
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      {
        messaging_product: 'whatsapp',
        call_id: call_id,  // Include call_id in the body
        action: 'pre_accept',
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Call pre-accepted:', response.data);
    
    res.json({
      success: true,
      message: 'Call pre-accepted successfully',
      call_id,
      whatsappResponse: response.data,
    });
  } catch (error: any) {
    console.error('Pre-accept call error:', error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to pre-accept call',
      details: error.response?.data,
    });
  }
};

// Mark missed calls as viewed
export const markCallsAsViewed = async (req: AuthRequest, res: Response) => {
  try {
    const { call_ids } = req.body;
    
    if (!call_ids || !Array.isArray(call_ids)) {
      return res.status(400).json({ error: 'call_ids array is required' });
    }
    
    console.log('👁️  Marking calls as viewed:', call_ids);
    
    // Update all specified calls
    const [updatedCount] = await Call.update(
      { viewed_at: new Date() },
      {
        where: {
          id: call_ids,
          user_id: req.user!.id,
          status: 'missed',
          viewed_at: null, // Only update if not already viewed
        },
      }
    );
    
    console.log(`✅ Marked ${updatedCount} calls as viewed`);
    
    res.json({
      success: true,
      message: `Marked ${updatedCount} calls as viewed`,
      updated_count: updatedCount,
    });
  } catch (error: any) {
    console.error('Mark calls as viewed error:', error);
    res.status(500).json({
      error: 'Failed to mark calls as viewed',
      details: error.message,
    });
  }
};

// Get unviewed missed calls count
export const getUnviewedMissedCallsCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await Call.count({
      where: {
        user_id: req.user!.id,
        status: 'missed',
        viewed_at: null,
      },
    });
    
    res.json({ count });
  } catch (error: any) {
    console.error('Get unviewed missed calls count error:', error);
    res.status(500).json({
      error: 'Failed to get unviewed missed calls count',
      details: error.message,
    });
  }
};
