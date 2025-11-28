import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const sendWhatsAppMessage = async (to: string, message: string, type: string = 'text', mediaUrl?: string, caption?: string) => {
  try {
    let messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type
    };

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
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    throw error;
  }
};

export const sendTemplateMessage = async (to: string, templateName: string, languageCode: string, components?: any[]) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
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
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
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

export const sendMediaMessage = async (to: string, mediaId: string, type: string, caption?: string, filename?: string) => {
  try {
    let messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type
    };

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
          id: mediaId
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
