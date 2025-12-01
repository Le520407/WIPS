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
      // Handle button reply
      if (message.interactive.type === 'button_reply' && message.interactive.button_reply) {
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
    } else {
      console.log('⚠️  Message not found for status update:', messageId);
    }

  } catch (error) {
    console.error('Process message status error:', error);
  }
};
