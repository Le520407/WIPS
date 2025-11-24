import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendWhatsAppMessage } from '../services/whatsapp.service';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.query;
    
    // TODO: Fetch messages from database
    const messages: any[] = [];
    
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { to, message, type = 'text' } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await sendWhatsAppMessage(to, message, type);
    
    // TODO: Save message to database
    
    res.json({ success: true, messageId: result.messages[0].id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Fetch conversations from database
    const conversations: any[] = [];
    
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};
