import axios from 'axios';
import Website from '../models/Website';
import MessageLog from '../models/MessageLog';

interface SendMessageParams {
  to: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template';
  text?: {
    body: string;
  };
  image?: {
    link?: string;
    id?: string;
    caption?: string;
  };
  video?: {
    link?: string;
    id?: string;
    caption?: string;
  };
  audio?: {
    link?: string;
    id?: string;
  };
  document?: {
    link?: string;
    id?: string;
    caption?: string;
    filename?: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

interface MessageRouterResult {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}

/**
 * Message Router Service
 * Routes messages to the correct WhatsApp Phone Number ID based on website
 */
export class MessageRouterService {
  private accessToken: string;
  private apiVersion: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  }

  /**
   * Send a message using the website's Phone Number ID
   */
  async sendMessage(
    websiteId: string,
    params: SendMessageParams
  ): Promise<MessageRouterResult> {
    try {
      // Get website configuration
      const website = await Website.findByPk(websiteId);
      
      if (!website) {
        return {
          success: false,
          error: 'Website not found'
        };
      }

      if (!website.is_active) {
        return {
          success: false,
          error: 'Website is not active'
        };
      }

      // Build WhatsApp API request
      const url = `https://graph.facebook.com/${this.apiVersion}/${website.phone_number_id}/messages`;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: params.type
      };

      // Add type-specific data
      if (params.type === 'text' && params.text) {
        payload.text = params.text;
      } else if (params.type === 'image' && params.image) {
        payload.image = params.image;
      } else if (params.type === 'video' && params.video) {
        payload.video = params.video;
      } else if (params.type === 'audio' && params.audio) {
        payload.audio = params.audio;
      } else if (params.type === 'document' && params.document) {
        payload.document = params.document;
      } else if (params.type === 'template' && params.template) {
        payload.template = params.template;
      }

      // Send to WhatsApp API
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const messageId = response.data.messages?.[0]?.id;

      // Log message in database
      await this.logMessage(websiteId, params.to, params.type, messageId, 'sent');

      return {
        success: true,
        messageId,
        data: response.data
      };
    } catch (error: any) {
      console.error('Message routing error:', error.response?.data || error.message);
      
      // Log failed message
      await this.logMessage(websiteId, params.to, params.type, null, 'failed');

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Log message to database
   */
  private async logMessage(
    websiteId: string,
    to: string,
    type: string,
    messageId: string | null,
    status: string
  ): Promise<void> {
    try {
      await MessageLog.create({
        website_id: websiteId,
        to,
        from: null,
        type,
        status,
        whatsapp_message_id: messageId,
        direction: 'outbound',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging message:', error);
      // Don't throw - logging should not block message sending
    }
  }

  /**
   * Get message history for a website
   */
  async getMessageHistory(
    websiteId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const messages = await MessageLog.findAll({
        where: { website_id: websiteId },
        order: [['timestamp', 'DESC']],
        limit,
        offset
      });

      return messages;
    } catch (error) {
      console.error('Error fetching message history:', error);
      return [];
    }
  }

  /**
   * Get message statistics for a website
   */
  async getMessageStats(websiteId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const messages = await MessageLog.findAll({
        where: {
          website_id: websiteId,
          timestamp: {
            $gte: startDate
          }
        }
      });

      const stats = {
        total: messages.length,
        sent: messages.filter(m => m.status === 'sent').length,
        delivered: messages.filter(m => m.status === 'delivered').length,
        read: messages.filter(m => m.status === 'read').length,
        failed: messages.filter(m => m.status === 'failed').length,
        byType: {} as Record<string, number>
      };

      // Count by type
      messages.forEach(msg => {
        stats.byType[msg.type] = (stats.byType[msg.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching message stats:', error);
      return {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        byType: {}
      };
    }
  }
}

export default new MessageRouterService();
