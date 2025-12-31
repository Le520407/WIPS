import axios from 'axios';
import User from '../models/User';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// Helper function to get user's WhatsApp config
export const getUserWhatsAppConfig = async (userId: string) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    phoneNumberId: user.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: user.access_token || process.env.WHATSAPP_ACCESS_TOKEN,
    wabaId: user.whatsapp_account_id || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
  };
};

export const sendWhatsAppMessage = async (
  to: string, 
  message: string, 
  type: string = 'text', 
  mediaUrl?: string, 
  caption?: string, 
  contextMessageId?: string,
  userId?: string  // Add userId parameter
) => {
  try {
    // Get user-specific config or fall back to env variables
    let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    let accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (userId) {
      const config = await getUserWhatsAppConfig(userId);
      phoneNumberId = config.phoneNumberId;
      accessToken = config.accessToken;
      console.log(`📱 Using user's WhatsApp config - Phone: ${phoneNumberId}`);
    }
    
    let messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type
    };
    
    // Add context if replying to a message
    if (contextMessageId) {
      messageBody.context = {
        message_id: contextMessageId
      };
    }

    // Build message based on type
    switch (type) {
      case 'text':
        messageBody.text = { body: message };
        break;
      
      case 'image':
        messageBody.image = {
          link: mediaUrl,
          caption: caption || message
        };
        break;
      
      case 'video':
        messageBody.video = {
          link: mediaUrl,
          caption: caption || message
        };
        break;
      
      case 'audio':
        messageBody.audio = {
          link: mediaUrl
        };
        break;
      
      case 'document':
        messageBody.document = {
          link: mediaUrl,
          caption: caption || message,
          filename: caption || 'document'
        };
        break;
      
      default:
        messageBody.text = { body: message };
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${phoneNumberId}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    throw error;
  }
};

export const sendTemplateMessage = async (
  to: string, 
  templateName: string, 
  languageCode: string, 
  components?: any[],
  userId?: string  // Add userId parameter
) => {
  try {
    // Get user-specific config or fall back to env variables
    let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    let accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (userId) {
      const config = await getUserWhatsAppConfig(userId);
      phoneNumberId = config.phoneNumberId;
      accessToken = config.accessToken;
      console.log(`📱 Using user's WhatsApp config - Phone: ${phoneNumberId}`);
    }
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components || []
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Send template message error:', error);
    throw error;
  }
};

export const getWhatsAppTemplates = async () => {
  try {
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${businessAccountId}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Get templates error:', error);
    return [];
  }
};

export const createWhatsAppTemplate = async (template: any) => {
  try {
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    // Clean template name (remove spaces and special characters)
    const cleanName = template.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    // Check if template has variables ({{1}}, {{2}}, etc.)
    const bodyComponent = template.components.find((c: any) => c.type === 'BODY');
    const hasVariables = bodyComponent && /\{\{\d+\}\}/.test(bodyComponent.text);
    
    // Format components with examples if variables are present
    const formattedComponents = template.components.map((component: any) => {
      if (component.type === 'BODY' && hasVariables) {
        // Extract variable count
        const matches = component.text.match(/\{\{\d+\}\}/g) || [];
        const variableCount = matches.length;
        
        // Add example values for variables (must be a 2D array!)
        const exampleValues = Array(variableCount).fill(0).map((_, i) => `Example ${i + 1}`);
        
        return {
          type: component.type,
          text: component.text,
          example: {
            body_text: [exampleValues]  // WhatsApp requires 2D array: [[val1, val2]]
          }
        };
      }
      return component;
    });
    
    // Format template according to WhatsApp API requirements
    const formattedTemplate = {
      name: cleanName,
      language: template.language,
      category: template.category,
      components: formattedComponents
    };
    
    console.log('Creating template:', JSON.stringify(formattedTemplate, null, 2));
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${businessAccountId}/message_templates`,
      formattedTemplate,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Create template error:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const deleteWhatsAppTemplate = async (templateName: string) => {
  try {
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    console.log(`🗑️ Deleting WhatsApp template: ${templateName}`);
    
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${API_VERSION}/${businessAccountId}/message_templates`,
      {
        params: {
          name: templateName
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Template deleted from WhatsApp:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete WhatsApp template error:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const uploadMediaToWhatsApp = async (fileBuffer: Buffer, mimeType: string, filename: string) => {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fileBuffer, {
      filename,
      contentType: mimeType
    });
    form.append('messaging_product', 'whatsapp');
    form.append('type', mimeType);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/media`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          ...form.getHeaders()
        }
      }
    );

    console.log('✅ Media uploaded to WhatsApp:', response.data);
    return response.data.id; // Returns media ID
  } catch (error: any) {
    console.error('Upload media error:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const sendMediaMessage = async (to: string, mediaId: string, type: string, caption?: string, filename?: string, contextMessageId?: string) => {
  try {
    let messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type
    };
    
    // Add context if replying to a message
    if (contextMessageId) {
      messageBody.context = {
        message_id: contextMessageId
      };
    }

    // Build message based on media type
    switch (type) {
      case 'image':
        messageBody.image = {
          id: mediaId,
          caption: caption
        };
        break;
      
      case 'video':
        messageBody.video = {
          id: mediaId,
          caption: caption
        };
        break;
      
      case 'audio':
        messageBody.audio = {
          id: mediaId,
          voice: false  // Basic audio message
        };
        break;
      
      case 'voice':
        // Voice messages: must be OGG with OPUS codec
        messageBody.type = 'audio';  // API expects type "audio"
        messageBody.audio = {
          id: mediaId,
          voice: true  // Voice message with transcription support
        };
        break;
      
      case 'document':
        messageBody.document = {
          id: mediaId,
          caption: caption,
          filename: filename || 'document.pdf'
        };
        break;
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send media message error:', error);
    throw error;
  }
};

export const getMediaUrl = async (mediaId: string) => {
  try {
    // First, get media info
    const mediaInfo = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    // Return the media URL (this URL requires authentication)
    return mediaInfo.data.url;
  } catch (error: any) {
    console.error('Get media URL error:', error);
    throw error;
  }
};

export const downloadMedia = async (mediaUrl: string) => {
  try {
    // Download media from WhatsApp with authentication
    const response = await axios.get(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      responseType: 'arraybuffer'
    });

    return {
      data: response.data,
      contentType: response.headers['content-type']
    };
  } catch (error: any) {
    console.error('Download media error:', error);
    throw error;
  }
};

export const sendInteractiveButtons = async (to: string, bodyText: string, buttons: Array<{id: string, title: string}>) => {
  try {
    // Validate buttons (max 3)
    if (buttons.length === 0 || buttons.length > 3) {
      throw new Error('Interactive buttons must have 1-3 buttons');
    }

    // Validate button titles (max 20 characters)
    for (const button of buttons) {
      if (button.title.length > 20) {
        throw new Error('Button title must be 20 characters or less');
      }
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText
        },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      }
    };

    console.log('Sending interactive buttons:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send interactive buttons error:', error);
    throw error;
  }
};

export const sendInteractiveList = async (
  to: string, 
  bodyText: string, 
  buttonText: string,
  sections: Array<{
    title: string,
    rows: Array<{
      id: string,
      title: string,
      description?: string
    }>
  }>
) => {
  try {
    // Validate sections
    if (sections.length === 0 || sections.length > 10) {
      throw new Error('Interactive list must have 1-10 sections');
    }

    // Count total rows
    let totalRows = 0;
    for (const section of sections) {
      totalRows += section.rows.length;
      
      // Validate row titles (max 24 characters)
      for (const row of section.rows) {
        if (row.title.length > 24) {
          throw new Error('Row title must be 24 characters or less');
        }
        if (row.description && row.description.length > 72) {
          throw new Error('Row description must be 72 characters or less');
        }
      }
    }

    if (totalRows > 10) {
      throw new Error('Interactive list can have maximum 10 rows in total');
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: bodyText
        },
        action: {
          button: buttonText,
          sections: sections
        }
      }
    };

    console.log('Sending interactive list:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send interactive list error:', error);
    throw error;
  }
};

export const sendInteractiveCTA = async (
  to: string,
  bodyText: string,
  buttonText: string,
  url: string
) => {
  try {
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://');
    }

    // Validate button text (max 20 characters)
    if (buttonText.length > 20) {
      throw new Error('Button text must be 20 characters or less');
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        body: {
          text: bodyText
        },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: buttonText,
            url: url
          }
        }
      }
    };

    console.log('Sending interactive CTA:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send interactive CTA error:', error);
    throw error;
  }
};

export const sendLocation = async (
  to: string,
  latitude: number,
  longitude: number,
  name?: string,
  address?: string
) => {
  try {
    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'location',
      location: {
        latitude: latitude.toString(),
        longitude: longitude.toString()
      }
    };

    // Add optional fields
    if (name) {
      messageBody.location.name = name;
    }
    if (address) {
      messageBody.location.address = address;
    }

    console.log('Sending location:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send location error:', error);
    throw error;
  }
};

export const sendContact = async (
  to: string,
  contacts: Array<{
    name: {
      formatted_name: string;
      first_name?: string;
      last_name?: string;
    };
    phones?: Array<{
      phone: string;
      type?: string;
    }>;
    emails?: Array<{
      email: string;
      type?: string;
    }>;
    org?: {
      company?: string;
      department?: string;
      title?: string;
    };
  }>
) => {
  try {
    // Validate contacts
    if (!contacts || contacts.length === 0) {
      throw new Error('At least one contact is required');
    }

    // Validate each contact has required fields
    for (const contact of contacts) {
      if (!contact.name || !contact.name.formatted_name) {
        throw new Error('Contact must have a formatted_name');
      }
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'contacts',
      contacts: contacts
    };

    console.log('Sending contact:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send contact error:', error);
    throw error;
  }
};

export const sendReaction = async (
  to: string,
  messageId: string,
  emoji: string = ''
) => {
  try {
    // To remove a reaction, send an empty emoji string
    // If emoji is provided, it will add/update the reaction
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'reaction',
      reaction: {
        message_id: messageId,
        emoji: emoji // Empty string removes the reaction
      }
    };

    console.log('Sending reaction:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send reaction error:', error);
    throw error;
  }
};

export const sendTextWithContext = async (
  to: string,
  message: string,
  contextMessageId: string
) => {
  try {
    // Validate inputs
    if (!message || message.trim().length === 0) {
      throw new Error('Message text is required');
    }

    if (!contextMessageId) {
      throw new Error('Context message ID is required');
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      context: {
        message_id: contextMessageId
      },
      text: {
        body: message
      }
    };

    console.log('Sending text with context:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send text with context error:', error);
    throw error;
  }
};

export const sendSticker = async (
  to: string,
  mediaId: string,
  contextMessageId?: string
) => {
  try {
    // Validate media ID
    if (!mediaId) {
      throw new Error('Media ID is required');
    }

    const messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'sticker',
      sticker: {
        id: mediaId
      }
    };

    // Add context if replying to a message
    if (contextMessageId) {
      messageBody.context = {
        message_id: contextMessageId
      };
    }

    console.log('Sending sticker:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send sticker error:', error);
    throw error;
  }
};

export const sendStickerByUrl = async (
  to: string,
  stickerUrl: string,
  contextMessageId?: string
) => {
  try {
    // Validate URL
    if (!stickerUrl || (!stickerUrl.startsWith('http://') && !stickerUrl.startsWith('https://'))) {
      throw new Error('Valid sticker URL is required');
    }

    const messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'sticker',
      sticker: {
        link: stickerUrl
      }
    };

    // Add context if replying to a message
    if (contextMessageId) {
      messageBody.context = {
        message_id: contextMessageId
      };
    }

    console.log('Sending sticker by URL:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send sticker by URL error:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    // Validate message ID
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    // Clean message ID - remove any UUID suffix that might have been appended
    // WhatsApp message IDs should only be the wamid.xxx part
    let cleanMessageId = messageId;
    if (messageId.includes('_')) {
      // Split by underscore and take only the first part (the wamid)
      cleanMessageId = messageId.split('_')[0];
      console.log('🧹 Cleaned message ID:', {
        original: messageId,
        cleaned: cleanMessageId
      });
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: cleanMessageId
    };

    console.log('Marking message as read:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Mark message as read error:', error);
    throw error;
  }
};

// Typing Indicators
// Typing indicators work by marking a message as read AND including typing_indicator object
// This requires a message_id from a received message (from webhook)
export const sendTypingIndicator = async (to: string, messageId: string) => {
  try {
    if (!to || !messageId) {
      throw new Error('Recipient number and message ID are required');
    }

    // According to WhatsApp Cloud API docs:
    // To show typing indicator, mark message as read with typing_indicator object
    const messageBody = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
      typing_indicator: {
        type: 'text'
      }
    };

    console.log('Sending typing indicator:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send typing indicator error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

// Request Location
export const requestLocation = async (to: string, bodyText: string) => {
  try {
    if (!to || !bodyText) {
      throw new Error('Recipient number and body text are required');
    }

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'location_request_message',
        body: {
          text: bodyText
        },
        action: {
          name: 'send_location'
        }
      }
    };

    console.log('Requesting location from:', to);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Request location error:', error.response?.data || error);
    throw error;
  }
};

// Send Address (as Contact with Address)
export const sendAddress = async (
  to: string,
  name: string,
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: string; // HOME, WORK
  }
) => {
  try {
    // Validate inputs
    if (!to || !name) {
      throw new Error('Recipient number and name are required');
    }

    if (!address || Object.keys(address).length === 0) {
      throw new Error('Address information is required');
    }

    // Build contact with address
    const contact: any = {
      name: {
        formatted_name: name,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || undefined
      },
      addresses: [
        {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
          country_code: address.country_code,
          type: address.type || 'HOME'
        }
      ]
    };

    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'contacts',
      contacts: [contact]
    };

    console.log('Sending address:', JSON.stringify(messageBody, null, 2));

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Send address error:', error);
    throw error;
  }
};


// ==================== Template Groups ====================

const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

export const createTemplateGroup = async (name: string, description: string, templateIds: (string | number)[]) => {
  try {
    console.log('📦 Creating template group:', { name, description, templateIds });
    
    // Convert template IDs to the format WhatsApp API expects
    const templates = templateIds.map(id => ({ id: id.toString() }));
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/template_groups`,
      {
        name,
        description,
        whatsapp_business_templates: templates
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Template group created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create template group error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTemplateGroup = async (groupId: string) => {
  try {
    console.log('📦 Getting template group:', groupId);
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Template group retrieved');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get template group error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateTemplateGroup = async (
  groupId: string, 
  updates: {
    name?: string;
    description?: string;
    add_templates?: number[];
    remove_templates?: number[];
  }
) => {
  try {
    console.log('📦 Updating template group:', groupId, updates);
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Template group updated');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update template group error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteTemplateGroup = async (groupId: string) => {
  try {
    console.log('📦 Deleting template group:', groupId);
    
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Template group deleted');
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete template group error:', error.response?.data || error.message);
    throw error;
  }
};

export const listTemplateGroups = async () => {
  try {
    console.log('📦 Listing template groups');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/template_groups`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Template groups retrieved:', response.data.data?.length || 0);
    return response.data.data || [];
  } catch (error: any) {
    console.error('❌ List template groups error:', error.response?.data || error.message);
    throw error;
  }
};


// ==================== Template Group Analytics ====================

export const getTemplateGroupAnalytics = async (groupId: string, startDate?: string, endDate?: string) => {
  try {
    console.log('📊 Getting template group analytics:', groupId);
    
    // Build query parameters
    const params: any = {
      metric: 'sent,delivered,read,clicked',
      granularity: 'daily'
    };
    
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    
    const queryString = new URLSearchParams(params).toString();
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}/insights?${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Template group analytics retrieved');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get template group analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTemplateAnalytics = async (templateId: string, startDate?: string, endDate?: string) => {
  try {
    console.log('📊 Getting template analytics:', templateId);
    
    const params: any = {
      metric: 'sent,delivered,read,clicked',
      granularity: 'daily'
    };
    
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    
    const queryString = new URLSearchParams(params).toString();
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${templateId}/insights?${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Template analytics retrieved');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get template analytics error:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== Template Quality Monitoring ====================

export const getTemplateQuality = async (templateId: string) => {
  try {
    console.log('🔍 Getting template quality:', templateId);
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${templateId}?fields=quality_score`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Template quality retrieved');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get template quality error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllTemplatesQuality = async () => {
  try {
    console.log('🔍 Getting all templates quality');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/message_templates?fields=id,name,status,quality_score`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ All templates quality retrieved');
    return response.data.data || [];
  } catch (error: any) {
    console.error('❌ Get all templates quality error:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to interpret quality score
export const getQualityLevel = (qualityScore: any) => {
  if (!qualityScore) {
    return { level: 'unknown', color: 'gray', label: 'Unknown' };
  }
  
  const score = qualityScore.score;
  
  if (score === 'HIGH') {
    return { level: 'high', color: 'green', label: 'High Quality' };
  } else if (score === 'MEDIUM') {
    return { level: 'medium', color: 'yellow', label: 'Medium Quality' };
  } else if (score === 'LOW') {
    return { level: 'low', color: 'red', label: 'Low Quality' };
  } else {
    return { level: 'pending', color: 'gray', label: 'Quality Pending' };
  }
};

// ==================== Template Group Insights ====================

export const getTemplateGroupInsights = async (templateGroupId: string, startDate?: string, endDate?: string) => {
  try {
    console.log('📊 Getting template group insights:', templateGroupId);
    
    // Build query parameters
    const params: any = {
      fields: 'sent,delivered,read,clicked'
    };
    
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${templateGroupId}/insights`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        params
      }
    );
    
    console.log('✅ Template group insights retrieved');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get template group insights error:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to calculate analytics metrics
export const calculateAnalyticsMetrics = (insights: any) => {
  const sent = insights.sent || 0;
  const delivered = insights.delivered || 0;
  const read = insights.read || 0;
  const clicked = insights.clicked || 0;
  
  return {
    sent,
    delivered,
    read,
    clicked,
    deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(2) : '0.00',
    readRate: delivered > 0 ? ((read / delivered) * 100).toFixed(2) : '0.00',
    clickRate: read > 0 ? ((clicked / read) * 100).toFixed(2) : '0.00',
    engagement: sent > 0 ? (((read + clicked) / sent) * 100).toFixed(2) : '0.00'
  };
};


// ==================== Template Pausing Detection ====================

export const checkTemplatePausingStatus = async (templateId: string) => {
  try {
    console.log('🔍 Checking template pausing status:', templateId);
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${templateId}?fields=id,name,status,quality_score,rejected_reason`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    const template = response.data;
    const isPaused = template.status === 'PAUSED' || template.status === 'DISABLED';
    
    console.log('✅ Template pausing status checked');
    return {
      ...template,
      isPaused,
      pauseInfo: isPaused ? getPauseInfo(template) : null
    };
  } catch (error: any) {
    console.error('❌ Check template pausing error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllTemplatesPausingStatus = async () => {
  try {
    console.log('🔍 Checking all templates pausing status');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/message_templates?fields=id,name,status,quality_score,rejected_reason`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    const templates = response.data.data || [];
    const pausedTemplates = templates.filter((t: any) => 
      t.status === 'PAUSED' || t.status === 'DISABLED'
    );
    
    console.log(`✅ Found ${pausedTemplates.length} paused template(s)`);
    return {
      all: templates,
      paused: pausedTemplates.map((t: any) => ({
        ...t,
        isPaused: true,
        pauseInfo: getPauseInfo(t)
      })),
      pausedCount: pausedTemplates.length
    };
  } catch (error: any) {
    console.error('❌ Check all templates pausing error:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to get pause information
function getPauseInfo(template: any) {
  const info: any = {
    status: template.status,
    reason: 'Unknown',
    severity: 'warning',
    suggestions: []
  };
  
  // Determine pause reason based on available data
  if (template.quality_score?.score === 'LOW') {
    info.reason = 'Low Quality Score';
    info.severity = 'error';
    info.suggestions = [
      'Review and improve template content',
      'Ensure messages are relevant to recipients',
      'Avoid spammy or promotional language',
      'Test with a small audience first'
    ];
  } else if (template.rejected_reason) {
    info.reason = template.rejected_reason;
    info.severity = 'error';
    info.suggestions = [
      'Review WhatsApp Business Policy',
      'Modify template to comply with guidelines',
      'Contact WhatsApp support if needed'
    ];
  } else if (template.status === 'DISABLED') {
    info.reason = 'Template Disabled';
    info.severity = 'error';
    info.suggestions = [
      'Check for policy violations',
      'Review template content',
      'Contact WhatsApp support for details'
    ];
  } else if (template.status === 'PAUSED') {
    info.reason = 'Template Paused';
    info.severity = 'warning';
    info.suggestions = [
      'Check quality score',
      'Review recent feedback',
      'Wait for automatic resume or contact support'
    ];
  }
  
  return info;
}

// Helper function to get pause reason category
export const getPauseReasonCategory = (template: any) => {
  if (!template.isPaused) {
    return null;
  }
  
  const pauseInfo = template.pauseInfo || getPauseInfo(template);
  
  return {
    category: pauseInfo.reason,
    severity: pauseInfo.severity,
    icon: pauseInfo.severity === 'error' ? 'XCircle' : 'AlertTriangle',
    color: pauseInfo.severity === 'error' ? 'red' : 'yellow'
  };
};

// Tier and Marketing Limits
export const getMessagingLimitTier = async () => {
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        params: {
          fields: 'quality_rating,messaging_limit_tier,display_phone_number,verified_name'
        }
      }
    );

    const data = response.data;
    const tier = data.messaging_limit_tier || 'TIER_1';
    
    return {
      tier,
      quality_rating: data.quality_rating || 'UNKNOWN',
      daily_limit: getTierDailyLimit(tier),
      phone_number: data.display_phone_number,
      business_name: data.verified_name,
      account_id: data.id
    };
  } catch (error: any) {
    console.error('Error fetching tier status:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to get daily limit for a tier
function getTierDailyLimit(tier: string): number {
  const limits: Record<string, number> = {
    'TIER_1': 1000,
    'TIER_2': 10000,
    'TIER_3': 100000,
    'TIER_4': Infinity
  };
  return limits[tier] || 1000;
}

// Get tier upgrade path
export const getTierUpgradePath = (currentTier: string) => {
  const paths: Record<string, any> = {
    'TIER_1': {
      current: 'Tier 1',
      currentLimit: 1000,
      next: 'Tier 2',
      nextLimit: 10000,
      requirements: [
        'Maintain high quality rating',
        'Keep block/report rate low',
        'Consistent sending patterns'
      ]
    },
    'TIER_2': {
      current: 'Tier 2',
      currentLimit: 10000,
      next: 'Tier 3',
      nextLimit: 100000,
      requirements: [
        'Excellent quality rating',
        'Very low block/report rate',
        'High engagement rates'
      ]
    },
    'TIER_3': {
      current: 'Tier 3',
      currentLimit: 100000,
      next: 'Tier 4',
      nextLimit: Infinity,
      requirements: [
        'Outstanding quality rating',
        'Minimal block/report rate',
        'Proven track record'
      ]
    },
    'TIER_4': {
      current: 'Tier 4',
      currentLimit: Infinity,
      next: null,
      nextLimit: null,
      requirements: ['You are at the highest tier!']
    }
  };
  
  return paths[currentTier] || paths['TIER_1'];
};

// Get quality recommendations based on rating
export const getQualityRecommendations = (qualityRating: string) => {
  const recommendations: Record<string, any> = {
    'GREEN': {
      status: 'Excellent',
      color: 'green',
      icon: 'CheckCircle',
      suggestions: [
        'Great job! Keep maintaining high quality',
        'Continue following best practices',
        'Monitor engagement rates regularly'
      ]
    },
    'YELLOW': {
      status: 'Needs Improvement',
      color: 'yellow',
      icon: 'AlertTriangle',
      suggestions: [
        'Review template content for quality',
        'Reduce sending frequency if needed',
        'Improve audience targeting',
        'Monitor block/report rates'
      ]
    },
    'RED': {
      status: 'Critical',
      color: 'red',
      icon: 'XCircle',
      suggestions: [
        'URGENT: Stop sending marketing messages temporarily',
        'Review all templates for policy compliance',
        'Check for high block/report rates',
        'Contact WhatsApp support immediately'
      ]
    },
    'UNKNOWN': {
      status: 'Pending',
      color: 'gray',
      icon: 'HelpCircle',
      suggestions: [
        'Quality rating is being evaluated',
        'Continue sending messages normally',
        'Rating will be available soon'
      ]
    }
  };
  
  return recommendations[qualityRating] || recommendations['UNKNOWN'];
};


/**
 * Delete a message
 * https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#deleting-messages
 */
export const deleteMessage = async (messageId: string) => {
  try {
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log('✅ Message deleted:', messageId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete message error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send Media Carousel Message
 * Sends a horizontally scrollable carousel with image/video cards and CTA buttons
 */
export const sendMediaCarousel = async (
  to: string,
  bodyText: string,
  cards: Array<{
    cardIndex: number;
    headerType: 'image' | 'video';
    mediaLink: string;
    bodyText?: string;
    buttonText: string;
    buttonUrl: string;
  }>
): Promise<any> => {
  try {
    // Validate cards
    if (!cards || cards.length < 2 || cards.length > 10) {
      throw new Error('Media carousel must have between 2 and 10 cards');
    }

    // Validate all cards have the same header type
    const firstHeaderType = cards[0].headerType;
    if (!cards.every(card => card.headerType === firstHeaderType)) {
      throw new Error('All cards must have the same header type (image or video)');
    }

    // Build cards array
    const formattedCards = cards.map((card, index) => ({
      card_index: card.cardIndex !== undefined ? card.cardIndex : index,
      type: 'cta_url',
      header: {
        type: card.headerType,
        [card.headerType]: {
          link: card.mediaLink
        }
      },
      body: card.bodyText ? {
        text: card.bodyText.substring(0, 160) // Max 160 chars
      } : undefined,
      action: {
        name: 'cta_url',
        parameters: {
          display_text: card.buttonText.substring(0, 20), // Max 20 chars
          url: card.buttonUrl
        }
      }
    }));

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'carousel',
        body: {
          text: bodyText.substring(0, 1024) // Max 1024 chars
        },
        action: {
          cards: formattedCards
        }
      }
    };

    const url = `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending media carousel:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send Product Carousel Message
 * Sends a horizontally scrollable carousel with product cards from catalog
 */
export const sendProductCarousel = async (
  to: string,
  bodyText: string,
  catalogId: string,
  products: Array<{
    cardIndex: number;
    productRetailerId: string;
  }>
): Promise<any> => {
  try {
    // Validate products
    if (!products || products.length < 2 || products.length > 10) {
      throw new Error('Product carousel must have between 2 and 10 products');
    }

    // Build cards array
    const formattedCards = products.map((product, index) => ({
      card_index: product.cardIndex !== undefined ? product.cardIndex : index,
      type: 'product',
      action: {
        product_retailer_id: product.productRetailerId,
        catalog_id: catalogId
      }
    }));

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'carousel',
        body: {
          text: bodyText.substring(0, 1024) // Max 1024 chars
        },
        action: {
          cards: formattedCards
        }
      }
    };

    const url = `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending product carousel:', error.response?.data || error.message);
    throw error;
  }
};
