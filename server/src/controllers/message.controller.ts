import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendWhatsAppMessage, uploadMediaToWhatsApp, sendMediaMessage } from '../services/whatsapp.service';
import { AudioConverterService } from '../services/audio-converter.service';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.query;
    
    let whereClause: any = { user_id: req.user!.id };
    
    // If conversationId is provided, get the phone number and filter by it
    if (conversationId) {
      const conversation = await Conversation.findByPk(conversationId as string);
      if (conversation && conversation.user_id === req.user!.id) {
        // Filter messages by phone number (either to or from)
        const { Op } = require('sequelize');
        whereClause = {
          user_id: req.user!.id,
          [Op.or]: [
            { to_number: conversation.phone_number },
            { from_number: conversation.phone_number }
          ]
        };
      }
    }
    
    const messages = await Message.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // Get latest messages first
      limit: 200, // Increased limit to ensure new messages are included
    });
    
    // Reverse to chronological order (oldest first)
    const chronologicalMessages = messages.reverse();
    
    console.log(`📊 Loaded ${chronologicalMessages.length} messages for conversation`);
    
    res.json({ messages: chronologicalMessages.map(m => m.toJSON()) });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { to, message, type = 'text', mediaUrl, caption } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient number is required' });
    }

    if (type === 'text' && !message) {
      return res.status(400).json({ error: 'Message content is required for text messages' });
    }

    if (['image', 'video', 'audio', 'document'].includes(type) && !mediaUrl) {
      return res.status(400).json({ error: 'Media URL is required for media messages' });
    }

    // Normalize phone number (remove + if present for storage)
    const normalizedPhone = to.replace(/^\+/, '');

    // Send message using user's WhatsApp config
    const result = await sendWhatsAppMessage(to, message, type, mediaUrl, caption, undefined, req.user!.id);
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: message || caption || '',
      type,
      status: 'sent',
      message_id: result.messages[0].id,
      media_url: mediaUrl,
    });

    // Update or create conversation (use normalized phone)
    const displayMessage = type === 'text' ? message : `[${type.toUpperCase()}] ${caption || ''}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    // If conversation already exists, update it
    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.findAll({
      where: { user_id: req.user!.id },
      order: [['last_message_time', 'DESC']],
    });
    
    res.json({ conversations: conversations.map(c => c.toJSON()) });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const markConversationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({
      where: { 
        id: conversationId,
        user_id: req.user!.id 
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    await conversation.update({ unread_count: 0 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
};

export const uploadMedia = async (req: AuthRequest, res: Response) => {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let { buffer, mimetype, originalname } = req.file;
    
    // Check if audio file needs conversion (WebM -> OGG)
    if (mimetype.startsWith('audio/') && AudioConverterService.needsConversion(mimetype)) {
      console.log('🔄 Audio file needs conversion:', {
        originalType: mimetype,
        originalName: originalname
      });
      
      try {
        // Create temp files
        const tempDir = os.tmpdir();
        tempInputPath = path.join(tempDir, `input_${Date.now()}_${originalname}`);
        const outputFilename = AudioConverterService.getOggFilename(originalname);
        tempOutputPath = path.join(tempDir, `output_${Date.now()}_${outputFilename}`);
        
        // Write input file
        await fs.writeFile(tempInputPath, buffer);
        
        // Convert to OGG
        await AudioConverterService.convertToOgg(tempInputPath, tempOutputPath);
        
        // Read converted file
        buffer = await fs.readFile(tempOutputPath);
        mimetype = 'audio/ogg; codecs=opus';
        originalname = outputFilename;
        
        console.log('✅ Audio converted successfully:', {
          newType: mimetype,
          newName: originalname,
          newSize: buffer.length
        });
      } catch (conversionError: any) {
        console.error('⚠️ Audio conversion failed, using original file:', conversionError.message);
        // Continue with original file if conversion fails
      } finally {
        // Clean up temp files
        if (tempInputPath) {
          try { await fs.unlink(tempInputPath); } catch (e) {}
        }
        if (tempOutputPath) {
          try { await fs.unlink(tempOutputPath); } catch (e) {}
        }
      }
    }
    
    // Upload to WhatsApp
    const mediaId = await uploadMediaToWhatsApp(buffer, mimetype, originalname);
    
    res.json({ 
      success: true, 
      mediaId,
      filename: originalname,
      mimeType: mimetype
    });
  } catch (error) {
    console.error('Upload media error:', error);
    
    // Clean up temp files on error
    if (tempInputPath) {
      try { await fs.unlink(tempInputPath); } catch (e) {}
    }
    if (tempOutputPath) {
      try { await fs.unlink(tempOutputPath); } catch (e) {}
    }
    
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

export const sendMediaMessageController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, mediaId, type, caption, filename, contextMessageId } = req.body;
    
    if (!to || !mediaId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const result = await sendMediaMessage(to, mediaId, type, caption, filename, contextMessageId);
    
    // Find the original message to get its content and media (if replying)
    let contextMessageContent = null;
    let contextMessageType = null;
    let contextMessageMediaUrl = null;
    
    if (contextMessageId) {
      const originalMessage = await Message.findOne({
        where: { message_id: contextMessageId }
      });
      if (originalMessage) {
        contextMessageContent = originalMessage.content;
        contextMessageType = originalMessage.type;
        contextMessageMediaUrl = originalMessage.media_url;
      }
    }
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: caption || '',
      type,
      status: 'sent',
      message_id: result.messages[0].id,
      media_id: mediaId,
      context_message_id: contextMessageId,
      context_message_content: contextMessageContent,
      context_message_type: contextMessageType,
      context_message_media_url: contextMessageMediaUrl,
    });

    // Update conversation
    const displayMessage = `[${type.toUpperCase()}] ${caption || ''}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error) {
    console.error('Send media message error:', error);
    res.status(500).json({ error: 'Failed to send media message' });
  }
};

export const getMediaUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId } = req.params;
    
    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' });
    }

    const { getMediaUrl: getMediaUrlService, downloadMedia } = require('../services/whatsapp.service');
    
    // Get media URL from WhatsApp
    const mediaUrl = await getMediaUrlService(mediaId);
    
    // Download media with authentication
    const mediaData = await downloadMedia(mediaUrl);
    
    // Send media directly to client
    res.set('Content-Type', mediaData.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(Buffer.from(mediaData.data));
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
};

export const sendInteractiveButtonsController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, bodyText, buttons } = req.body;
    
    if (!to || !bodyText || !buttons || !Array.isArray(buttons)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendInteractiveButtons } = require('../services/whatsapp.service');
    const result = await sendInteractiveButtons(to, bodyText, buttons);
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: bodyText,
      type: 'interactive',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[BUTTONS] ${bodyText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send interactive buttons error:', error);
    res.status(500).json({ error: error.message || 'Failed to send interactive buttons' });
  }
};

export const sendInteractiveListController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, bodyText, buttonText, sections } = req.body;
    
    if (!to || !bodyText || !buttonText || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendInteractiveList } = require('../services/whatsapp.service');
    const result = await sendInteractiveList(to, bodyText, buttonText, sections);
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: bodyText,
      type: 'interactive',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[LIST] ${bodyText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send interactive list error:', error);
    res.status(500).json({ error: error.message || 'Failed to send interactive list' });
  }
};

export const sendInteractiveCTAController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, bodyText, buttonText, url } = req.body;
    
    if (!to || !bodyText || !buttonText || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendInteractiveCTA } = require('../services/whatsapp.service');
    const result = await sendInteractiveCTA(to, bodyText, buttonText, url);
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: bodyText,
      type: 'interactive',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[CTA] ${bodyText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send interactive CTA error:', error);
    res.status(500).json({ error: error.message || 'Failed to send interactive CTA' });
  }
};

export const sendLocationController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, latitude, longitude, name, address } = req.body;
    
    if (!to || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields (to, latitude, longitude)' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendLocation } = require('../services/whatsapp.service');
    const result = await sendLocation(to, parseFloat(latitude), parseFloat(longitude), name, address);
    
    // Save message to database
    const locationText = name || address || `Location: ${latitude}, ${longitude}`;
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: locationText,
      type: 'location',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[LOCATION] ${locationText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send location error:', error);
    res.status(500).json({ error: error.message || 'Failed to send location' });
  }
};

export const sendContactController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, contacts } = req.body;
    
    if (!to || !contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Missing required fields (to, contacts)' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendContact } = require('../services/whatsapp.service');
    const result = await sendContact(to, contacts);
    
    // Save message to database
    const contactNames = contacts.map((c: any) => c.name.formatted_name).join(', ');
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: `Contact: ${contactNames}`,
      type: 'contacts',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[CONTACT] ${contactNames}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send contact error:', error);
    res.status(500).json({ error: error.message || 'Failed to send contact' });
  }
};

export const sendReactionController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, messageId, emoji } = req.body;
    
    if (!to || !messageId || emoji === undefined) {
      return res.status(400).json({ error: 'Missing required fields (to, messageId, emoji)' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendReaction } = require('../services/whatsapp.service');
    const result = await sendReaction(to, messageId, emoji);
    
    // Save reaction to database (optional - you might want to track reactions)
    const reactionText = emoji ? `Reacted with ${emoji}` : 'Removed reaction';
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: reactionText,
      type: 'reaction',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[REACTION] ${reactionText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send reaction error:', error);
    res.status(500).json({ error: error.message || 'Failed to send reaction' });
  }
};

export const sendTextWithContextController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, message, contextMessageId } = req.body;
    
    if (!to || !message || !contextMessageId) {
      return res.status(400).json({ error: 'Missing required fields (to, message, contextMessageId)' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendTextWithContext } = require('../services/whatsapp.service');
    const result = await sendTextWithContext(to, message, contextMessageId);
    
    // Find the original message to get its content and media
    let contextMessageContent = null;
    let contextMessageType = null;
    let contextMessageMediaUrl = null;
    
    if (contextMessageId) {
      const originalMessage = await Message.findOne({
        where: { message_id: contextMessageId }
      });
      if (originalMessage) {
        contextMessageContent = originalMessage.content;
        contextMessageType = originalMessage.type;
        contextMessageMediaUrl = originalMessage.media_url;
      }
    }
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: message,
      type: 'text',
      status: 'sent',
      message_id: result.messages[0].id,
      context_message_id: contextMessageId,
      context_message_content: contextMessageContent,
      context_message_type: contextMessageType,
      context_message_media_url: contextMessageMediaUrl,
    });

    // Update conversation
    const displayMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send text with context error:', error);
    res.status(500).json({ error: error.message || 'Failed to send text with context' });
  }
};

export const sendStickerController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, mediaId, stickerUrl, contextMessageId } = req.body;
    
    if (!to || (!mediaId && !stickerUrl)) {
      return res.status(400).json({ error: 'Missing required fields (to, and either mediaId or stickerUrl)' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendSticker, sendStickerByUrl } = require('../services/whatsapp.service');
    
    // Send sticker by media ID or URL (with optional context)
    const result = mediaId 
      ? await sendSticker(to, mediaId, contextMessageId)
      : await sendStickerByUrl(to, stickerUrl, contextMessageId);
    
    // Find the original message to get its content and media (if replying)
    let contextMessageContent = null;
    let contextMessageType = null;
    let contextMessageMediaUrl = null;
    
    if (contextMessageId) {
      const originalMessage = await Message.findOne({
        where: { message_id: contextMessageId }
      });
      if (originalMessage) {
        contextMessageContent = originalMessage.content;
        contextMessageType = originalMessage.type;
        contextMessageMediaUrl = originalMessage.media_url;
      }
    }
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: '[Sticker]',
      type: 'sticker',
      status: 'sent',
      message_id: result.messages[0].id,
      media_id: mediaId,
      media_url: stickerUrl,
      context_message_id: contextMessageId,
      context_message_content: contextMessageContent,
      context_message_type: contextMessageType,
      context_message_media_url: contextMessageMediaUrl,
    });

    // Update conversation
    const displayMessage = '[STICKER]';
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send sticker error:', error);
    res.status(500).json({ error: error.message || 'Failed to send sticker' });
  }
};

export const markMessageAsReadController = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    console.log('📨 Marking message as read:', messageId);

    const { markMessageAsRead } = require('../services/whatsapp.service');
    const result = await markMessageAsRead(messageId);
    
    console.log('✅ WhatsApp API response:', result);
    
    // Update message status in database (optional)
    await Message.update(
      { status: 'read' },
      { where: { message_id: messageId, user_id: req.user!.id } }
    );
    
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('❌ Mark message as read error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Return more detailed error information
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Failed to mark message as read',
      details: error.response?.data
    });
  }
};

export const sendTypingIndicatorController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, messageId } = req.body;
    
    if (!to || !messageId) {
      return res.status(400).json({ error: 'Recipient number and message ID are required' });
    }

    const { sendTypingIndicator } = require('../services/whatsapp.service');
    const result = await sendTypingIndicator(to, messageId);
    
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Send typing indicator error:', error);
    res.status(500).json({ error: error.message || 'Failed to send typing indicator' });
  }
};

export const requestLocationController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, bodyText } = req.body;
    
    if (!to || !bodyText) {
      return res.status(400).json({ error: 'Recipient number and body text are required' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { requestLocation } = require('../services/whatsapp.service');
    const result = await requestLocation(to, bodyText);
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: bodyText,
      type: 'interactive',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[LOCATION REQUEST] ${bodyText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Request location error:', error);
    res.status(500).json({ error: error.message || 'Failed to request location' });
  }
};

export const sendAddressController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, name, address } = req.body;
    
    if (!to || !name || !address) {
      return res.status(400).json({ error: 'Recipient number, name, and address are required' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendAddress } = require('../services/whatsapp.service');
    const result = await sendAddress(to, name, address);
    
    // Format address for display
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.zip,
      address.country
    ].filter(Boolean);
    const addressText = addressParts.join(', ');
    
    // Save message to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: `Address: ${name} - ${addressText}`,
      type: 'contacts',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[ADDRESS] ${name}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }
    
    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage.toJSON() });
  } catch (error: any) {
    console.error('Send address error:', error);
    res.status(500).json({ error: error.message || 'Failed to send address' });
  }
};


export const deleteMessageController = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    const { deleteMessage } = require('../services/whatsapp.service');
    const result = await deleteMessage(messageId);
    
    // Update message status in database
    await Message.update(
      { status: 'deleted' },
      { where: { message_id: messageId, user_id: req.user!.id } }
    );
    
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to delete message'
    });
  }
};

/**
 * Send Media Carousel
 */
export const sendMediaCarouselController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, bodyText, cards } = req.body;
    
    if (!to || !bodyText || !cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Missing required fields (to, bodyText, cards)' });
    }

    if (cards.length < 2 || cards.length > 10) {
      return res.status(400).json({ error: 'Cards must be between 2 and 10' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendMediaCarousel } = require('../services/whatsapp.service');
    const result = await sendMediaCarousel(to, bodyText, cards);
    
    // Save to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: `[MEDIA CAROUSEL] ${bodyText}`,
      type: 'interactive',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[MEDIA CAROUSEL] ${bodyText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }

    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage });
  } catch (error: any) {
    console.error('Send media carousel controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to send media carousel'
    });
  }
};

/**
 * Send Product Carousel
 */
export const sendProductCarouselController = async (req: AuthRequest, res: Response) => {
  try {
    const { to, bodyText, catalogId, products } = req.body;
    
    if (!to || !bodyText || !catalogId || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Missing required fields (to, bodyText, catalogId, products)' });
    }

    if (products.length < 2 || products.length > 10) {
      return res.status(400).json({ error: 'Products must be between 2 and 10' });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/^\+/, '');

    const { sendProductCarousel } = require('../services/whatsapp.service');
    const result = await sendProductCarousel(to, bodyText, catalogId, products);
    
    // Save to database
    const savedMessage = await Message.create({
      user_id: req.user!.id,
      from_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      to_number: normalizedPhone,
      content: `[PRODUCT CAROUSEL] ${bodyText}`,
      type: 'interactive',
      status: 'sent',
      message_id: result.messages[0].id,
    });

    // Update conversation
    const displayMessage = `[PRODUCT CAROUSEL] ${bodyText}`;
    const [conversation, created] = await Conversation.findOrCreate({
      where: { user_id: req.user!.id, phone_number: normalizedPhone },
      defaults: {
        last_message: displayMessage,
        last_message_time: new Date(),
      },
    });

    if (!created) {
      await conversation.update({
        last_message: displayMessage,
        last_message_time: new Date(),
      });
    }

    res.json({ success: true, messageId: result.messages[0].id, message: savedMessage });
  } catch (error: any) {
    console.error('Send product carousel controller error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to send product carousel'
    });
  }
};
