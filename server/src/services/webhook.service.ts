import { WhatsAppMessage } from '../types';

export const processWebhookMessage = async (message: WhatsAppMessage, metadata: any) => {
  try {
    console.log('📩 Received message:', {
      from: message.from,
      type: message.type,
      timestamp: message.timestamp
    });

    // TODO: Save message to database
    // TODO: Process message based on type
    // TODO: Send auto-reply if configured

    if (message.type === 'text' && message.text) {
      console.log('Message content:', message.text.body);
    }

  } catch (error) {
    console.error('Process webhook message error:', error);
  }
};
