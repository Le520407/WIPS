import { WhatsAppMessage } from '../types';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';

export const processWebhookMessage = async (message: WhatsAppMessage, metadata: any) => {
  try {
    console.log('📩 Received message:', {
      from: message.from,
      type: message.type,
      timestamp: message.timestamp
    });

    // Get message content and media info based on type
    let content = '';
    let mediaId = null;
    let caption = null;
    let contextMessageId = null;
    let contextMessageContent = null;
    
    // Check if this is a reply (has context)
    let contextMessageType = null;
    let contextMessageMediaUrl = null;
    
    if (message.context && message.context.message_id) {
      contextMessageId = message.context.message_id;
      console.log('📎 Reply to message:', contextMessageId);
      
      // Try to find the original message to get its content and media
      const originalMessage = await Message.findOne({
        where: { message_id: contextMessageId }
      });
      
      if (originalMessage) {
        contextMessageContent = originalMessage.content;
        contextMessageType = originalMessage.type;
        contextMessageMediaUrl = originalMessage.media_url;
        console.log('📎 Original message:', {
          type: contextMessageType,
          content: contextMessageContent?.substring(0, 30),
          hasMedia: !!contextMessageMediaUrl
        });
      }
    }
    
    if (message.type === 'text' && message.text) {
      content = message.text.body;
      console.log('Message content:', content);
    } else if (message.type === 'interactive' && message.interactive) {
      // Handle call permission reply
      const interactiveAny = message.interactive as any;
      if (interactiveAny.type === 'call_permission_reply' && interactiveAny.call_permission_reply) {
        const permissionReply = interactiveAny.call_permission_reply;
        console.log('📞 Call permission reply:', permissionReply);
        
        // Handle the permission response
        // Note: We'll need to find the user_id from the phone number
        // For now, we'll just log it and handle it in the message processing
        content = `[Call Permission: ${permissionReply.response}]`;
        
        // Store permission response data for later processing
        (message as any).permissionResponse = {
          response: permissionReply.response,
          is_permanent: permissionReply.is_permanent || false,
          expiration_timestamp: permissionReply.expiration_timestamp,
          response_source: permissionReply.response_source || 'user_action',
          context_id: (message.context as any)?.id,
        };
      }
      // Handle button reply
      else if (message.interactive.type === 'button_reply' && message.interactive.button_reply) {
        content = message.interactive.button_reply.title;
        console.log('Button reply:', content);
      } else if (message.interactive.type === 'list_reply' && message.interactive.list_reply) {
        content = message.interactive.list_reply.title;
        console.log('List reply:', content);
      } else {
        content = '[Interactive Response]';
      }
    } else if (message.type === 'image' && message.image) {
      mediaId = message.image.id;
      caption = message.image.caption || '';
      content = caption || '[Image]';
      console.log('Image message:', { mediaId, caption });
    } else if (message.type === 'video' && message.video) {
      mediaId = message.video.id;
      caption = message.video.caption || '';
      content = caption || '[Video]';
    } else if (message.type === 'audio' && message.audio) {
      mediaId = message.audio.id;
      content = '[Audio]';
    } else if (message.type === 'document' && message.document) {
      mediaId = message.document.id;
      caption = message.document.caption || '';
      content = message.document.filename || caption || '[Document]';
    } else if (message.type === 'location' && message.location) {
      // Handle location message
      const lat = message.location.latitude;
      const lng = message.location.longitude;
      const name = message.location.name || '';
      const address = message.location.address || '';
      
      content = `📍 Location: ${lat}, ${lng}`;
      if (name) content += `\nName: ${name}`;
      if (address) content += `\nAddress: ${address}`;
      
      console.log('Location message:', { lat, lng, name, address });
    } else if (message.type === 'sticker' && message.sticker) {
      // Handle sticker message
      mediaId = message.sticker.id;
      content = '[Sticker]';
      console.log('Sticker message:', { mediaId, animated: message.sticker.animated });
    } else {
      content = `[${message.type}]`;
    }

    // Normalize phone number (remove + if present)
    const normalizedPhone = message.from.replace(/^\+/, '');

    // Find all users who have this WhatsApp number configured
    // For now, we'll save to all users (you might want to filter by phone_number_id)
    const users = await User.findAll();
    
    // Only use the first user to avoid duplicate message issues
    const usersToSave = users.length > 0 ? [users[0]] : [];
    
    // Save message for each user
    for (const user of usersToSave) {
      try {
        // Check if message already exists for this user (avoid duplicates)
        const existingMessage = await Message.findOne({
          where: { 
            user_id: user.id,
            message_id: message.id 
          }
        });

        if (existingMessage) {
          console.log('⚠️  Message already exists for user, skipping:', user.email, message.id);
          continue;
        }

        await Message.create({
          user_id: user.id,
          from_number: normalizedPhone,
          to_number: metadata.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
          content,
          type: message.type,
          status: 'received',
          message_id: message.id, // Keep original WhatsApp message ID
          media_id: mediaId,
          caption: caption,
          context_message_id: contextMessageId,
          context_message_content: contextMessageContent,
          context_message_type: contextMessageType,
          context_message_media_url: contextMessageMediaUrl,
        });
        
        console.log('✅ Message saved for user:', user.email);

        // Handle call permission response if present
        if ((message as any).permissionResponse) {
          const permResp = (message as any).permissionResponse;
          const { handlePermissionResponse } = require('../controllers/call-permission.controller');
          
          try {
            await handlePermissionResponse(
              user.id,
              message.from,
              permResp.response,
              permResp.is_permanent,
              permResp.expiration_timestamp,
              permResp.response_source,
              permResp.context_id
            );
            console.log('✅ Call permission response handled for user:', user.email);
          } catch (permError) {
            console.error('❌ Failed to handle permission response:', permError);
          }
        }
      } catch (error: any) {
        console.error('❌ Failed to save message for user:', user.email);
        console.error('   Error:', error?.message || error);
        console.error('   Message ID:', message.id);
        if (error?.errors) {
          error.errors.forEach((e: any) => {
            console.error('   Field:', e.path, 'Error:', e.message);
          });
        }
      }
    }

    // Update conversations for all users
    for (const user of usersToSave) {
      // Try to find conversation with or without + prefix
      let conversation = await Conversation.findOne({
        where: { 
          user_id: user.id, 
          phone_number: normalizedPhone 
        }
      });

      if (!conversation) {
        conversation = await Conversation.findOne({
          where: { 
            user_id: user.id, 
            phone_number: '+' + normalizedPhone 
          }
        });

        // If found with +, update to normalized format
        if (conversation) {
          await conversation.update({ phone_number: normalizedPhone });
        }
      }

      // Create or update conversation
      if (!conversation) {
        conversation = await Conversation.create({
          user_id: user.id,
          phone_number: normalizedPhone,
          last_message: content,
          last_message_time: new Date(parseInt(message.timestamp) * 1000),
          unread_count: 1,
        });
      } else {
        await conversation.update({
          last_message: content,
          last_message_time: new Date(parseInt(message.timestamp) * 1000),
          unread_count: conversation.unread_count + 1,
        });
      }
      
      console.log('✅ Conversation updated for user:', user.email);
    }

    console.log('✅ Message saved to database');

  } catch (error) {
    console.error('Process webhook message error:', error);
  }
};

export const processMessageStatus = async (status: any, metadata: any) => {
  try {
    console.log('📊 Received status update:', {
      id: status.id,
      status: status.status,
      timestamp: status.timestamp,
      recipient_id: status.recipient_id
    });

    // Log error details if status is failed
    if (status.status === 'failed' && status.errors) {
      console.error('❌ Message failed with errors:', JSON.stringify(status.errors, null, 2));
    }

    // Update message status in database
    const messageId = status.id;
    const newStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

    // Find the message by WhatsApp message ID
    const message = await Message.findOne({
      where: { message_id: messageId }
    });

    if (message) {
      await message.update({ status: newStatus });
      console.log(`✅ Message status updated to "${newStatus}" for message:`, messageId);
      
      // Log additional context for failed messages
      if (newStatus === 'failed') {
        console.error('❌ Failed message details:', {
          messageId: message.id,
          type: message.type,
          content: message.content?.substring(0, 50),
          mediaId: message.media_id,
          toNumber: message.to_number
        });
      }
    } else {
      console.log('⚠️  Message not found for status update:', messageId);
    }

  } catch (error) {
    console.error('Process message status error:', error);
  }
};


// Process call webhook
export const processCallWebhook = async (call: any, metadata: any) => {
  try {
    console.log('📞 Received call webhook:', {
      callId: call.id,
      from: call.from,
      to: call.to,
      status: call.status,
      timestamp: call.timestamp,
    });

    const Call = require('../models/Call').default;
    const User = require('../models/User').default;

    // Normalize phone numbers
    const normalizedFrom = call.from.replace(/^\+/, '');
    const normalizedTo = call.to?.replace(/^\+/, '') || metadata.phone_number_id;

    // Normalize call status (WhatsApp sends uppercase, we need lowercase)
    // Map WhatsApp statuses to our database enum values
    const statusMap: { [key: string]: string } = {
      'RINGING': 'ringing',
      'CONNECTED': 'connected',
      'ANSWERED': 'connected',
      'ENDED': 'ended',
      'COMPLETED': 'ended',
      'REJECTED': 'rejected',
      'DECLINED': 'rejected',
      'MISSED': 'missed',
      'NO_ANSWER': 'missed',
      'CANCELLED': 'missed',
      'CANCELED': 'missed',
      'FAILED': 'failed',
      'BUSY': 'rejected',
      'TIMEOUT': 'missed',  // 添加超时状态
      'UNANSWERED': 'missed',  // 添加未接听状态
    };

    const rawStatus = call.status ? call.status.toUpperCase() : 'RINGING';
    let normalizedStatus = statusMap[rawStatus] || call.status?.toLowerCase() || 'ringing';
    
    console.log(`📊 Status mapping: ${call.status} (${rawStatus}) → ${normalizedStatus}`);

    // Find users
    const users = await User.findAll();
    const usersToSave = users.length > 0 ? [users[0]] : [];

    for (const user of usersToSave) {
      try {
        // Check if call already exists
        const existingCall = await Call.findOne({
          where: {
            user_id: user.id,
            call_id: call.id,
          },
        });

        if (existingCall) {
          // Update existing call
          const updateData: any = {
            status: normalizedStatus,
          };

          // Check if this is a missed call
          // If call ended but was never connected, it's a missed call
          const isIncoming = normalizedFrom !== metadata.phone_number_id;
          if (isIncoming && normalizedStatus === 'ended' && existingCall.status === 'ringing') {
            updateData.status = 'missed';
            normalizedStatus = 'missed';
            console.log('📞 Call ended without being answered - marking as MISSED');
          }

          // If call ended, calculate duration
          if ((normalizedStatus === 'ended' || normalizedStatus === 'missed') && call.end_time) {
            updateData.end_time = new Date(parseInt(call.end_time) * 1000);
            
            if (call.start_time) {
              const startTime = new Date(parseInt(call.start_time) * 1000);
              const endTime = new Date(parseInt(call.end_time) * 1000);
              updateData.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            }
          }

          await existingCall.update(updateData);
          console.log('✅ Call updated:', call.id, '- Status:', normalizedStatus);

          // Update call quality metrics
          if (isIncoming) {
            const { updateCallQuality } = require('../controllers/call-quality.controller');
            const phoneNumber = call.from;
            
            // Determine call outcome for quality tracking
            let callOutcome: 'connected' | 'missed' | 'rejected' | 'failed' = 'failed';
            if (normalizedStatus === 'connected') {
              callOutcome = 'connected';
            } else if (normalizedStatus === 'ended' && existingCall.status === 'connected') {
              // Call was connected and then ended normally
              callOutcome = 'connected';
            } else if (normalizedStatus === 'missed') {
              callOutcome = 'missed';
            } else if (normalizedStatus === 'rejected') {
              callOutcome = 'rejected';
            } else if (normalizedStatus === 'ended' && existingCall.status === 'ringing') {
              // Call ended while ringing - it's a missed call
              callOutcome = 'missed';
            }
            
            await updateCallQuality(user.id, phoneNumber, callOutcome);
            console.log(`📊 Call quality updated for ${phoneNumber}: ${callOutcome}`);
          }

          // Send call status update notification
          const notificationService = require('./notification.service').default;
          const notificationSent = notificationService.sendCallStatusUpdate(user.id, existingCall.id, normalizedStatus, {
            call_id: call.id,
            duration: updateData.duration,
            end_time: updateData.end_time,
          });
          
          if (notificationSent) {
            console.log(`📤 Call status update notification sent: ${normalizedStatus} (original: ${call.status})`);
          } else {
            console.log(`⚠️  No connected clients to receive call status update`);
          }
        } else {
          // Create new call record
          const isIncoming = normalizedFrom !== metadata.phone_number_id;

          // Extract SDP from session if present (for incoming calls)
          const sdp = call.session?.sdp || null;
          if (sdp) {
            console.log('📡 SDP received in webhook:', {
              type: call.session?.sdp_type,
              length: sdp.length
            });
          }

          const newCall = await Call.create({
            user_id: user.id,
            call_id: call.id,
            from_number: normalizedFrom,
            to_number: normalizedTo,
            type: isIncoming ? 'incoming' : 'outgoing',
            status: normalizedStatus,
            start_time: new Date(parseInt(call.timestamp) * 1000),
            context: call.context,
            sdp: sdp,
          });

          console.log('✅ Call saved:', call.id);

          // Send real-time notification for incoming calls
          if (isIncoming && (normalizedStatus === 'ringing' || !call.status)) {
            const notificationService = require('./notification.service').default;
            const sent = notificationService.sendIncomingCall(user.id, {
              id: newCall.id,
              call_id: call.id,
              from_number: call.from,
              to_number: call.to,
              status: normalizedStatus,
              timestamp: call.timestamp,
              sdp: sdp, // Include SDP in notification
            });
            
            if (sent) {
              console.log('📤 Incoming call notification sent to user:', user.id);
            } else {
              console.log('⚠️  No connected clients to receive notification');
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Failed to save call for user:', user.email);
        console.error('   Error:', error?.message || error);
      }
    }
  } catch (error) {
    console.error('Process call webhook error:', error);
  }
};
