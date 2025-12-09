import { Request, Response } from 'express';
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Send interactive message with call button (free-form)
 */
export const sendCallButtonMessage = async (req: Request, res: Response) => {
  try {
    const { to, body_text, button_text, ttl_minutes, payload } = req.body;

    // Validation
    if (!to) {
      return res.status(400).json({ error: 'Recipient phone number is required' });
    }

    if (!body_text) {
      return res.status(400).json({ error: 'Message body text is required' });
    }

    // Prepare message payload
    const messagePayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'voice_call',
        body: {
          text: body_text,
        },
        action: {
          name: 'voice_call',
          parameters: {},
        },
      },
    };

    // Add optional parameters
    if (button_text) {
      messagePayload.interactive.action.parameters.display_text = button_text.substring(0, 20); // Max 20 chars
    }

    if (ttl_minutes) {
      const ttl = Math.min(Math.max(1, ttl_minutes), 43200); // Between 1 and 43200 (30 days)
      messagePayload.interactive.action.parameters.ttl_minutes = ttl;
    }

    if (payload) {
      messagePayload.interactive.action.parameters.payload = payload.substring(0, 512); // Max 512 chars
    }

    console.log('📞 Sending call button message:', {
      to,
      body_text: body_text.substring(0, 50) + '...',
      button_text,
      ttl_minutes,
    });

    // Send message via WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Call button message sent successfully');

    res.json({
      success: true,
      message: 'Call button message sent successfully',
      message_id: response.data.messages[0].id,
      to: to,
      data: response.data,
    });
  } catch (error: any) {
    console.error('❌ Error sending call button message:', error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.data?.error?.code === 131026) {
      return res.status(400).json({
        error: 'Recipient WhatsApp version too old',
        message: 'The recipient needs to update their WhatsApp to receive call button messages',
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: 'Failed to send call button message',
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Create call button template
 */
export const createCallButtonTemplate = async (req: Request, res: Response) => {
  try {
    const { name, category, language, body_text, button_text, additional_buttons } = req.body;

    // Validation
    if (!name || !category || !language || !body_text) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'category', 'language', 'body_text'],
      });
    }

    // Prepare template components
    const components: any[] = [
      {
        type: 'BODY',
        text: body_text,
      },
    ];

    // Add buttons component
    const buttons: any[] = [
      {
        type: 'voice_call',
        text: button_text || 'Call Now',
      },
    ];

    // Add additional buttons if provided (e.g., URL button)
    if (additional_buttons && Array.isArray(additional_buttons)) {
      buttons.push(...additional_buttons);
    }

    components.push({
      type: 'BUTTONS',
      buttons: buttons,
    });

    const templatePayload = {
      name: name,
      category: category,
      language: language,
      components: components,
    };

    console.log('📝 Creating call button template:', { name, category, language });

    // Create template via WhatsApp API
    const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WABA_ID}/message_templates`,
      templatePayload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Call button template created successfully');

    res.json({
      success: true,
      message: 'Call button template created successfully',
      template_id: response.data.id,
      status: response.data.status,
      category: response.data.category,
      data: response.data,
    });
  } catch (error: any) {
    console.error('❌ Error creating call button template:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create call button template',
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Send call button template message
 */
export const sendCallButtonTemplate = async (req: Request, res: Response) => {
  try {
    const { to, template_name, language_code, ttl_minutes, payload } = req.body;

    // Validation
    if (!to || !template_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'template_name'],
      });
    }

    // Prepare template message payload
    const messagePayload: any = {
      to: to,
      messaging_product: 'whatsapp',
      type: 'template',
      recipient_type: 'individual',
      template: {
        name: template_name,
        language: {
          code: language_code || 'en',
        },
        components: [],
      },
    };

    // Add button component with parameters if provided
    if (ttl_minutes || payload) {
      const buttonComponent: any = {
        type: 'button',
        sub_type: 'voice_call',
        parameters: [],
      };

      if (ttl_minutes) {
        const ttl = Math.min(Math.max(1, ttl_minutes), 43200);
        buttonComponent.parameters.push({
          type: 'ttl_minutes',
          ttl_minutes: ttl,
        });
      }

      if (payload) {
        buttonComponent.parameters.push({
          type: 'payload',
          payload: payload.substring(0, 512),
        });
      }

      messagePayload.template.components.push(buttonComponent);
    }

    console.log('📞 Sending call button template:', {
      to,
      template_name,
      language_code,
    });

    // Send template message via WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Call button template sent successfully');

    res.json({
      success: true,
      message: 'Call button template sent successfully',
      message_id: response.data.messages[0].id,
      to: to,
      data: response.data,
    });
  } catch (error: any) {
    console.error('❌ Error sending call button template:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to send call button template',
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Generate call deep link
 */
export const generateCallDeepLink = async (req: Request, res: Response) => {
  try {
    const { phone_number, payload } = req.body;

    // Use business phone number if not provided
    const targetPhone = phone_number || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!targetPhone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Format phone number (remove + if present)
    const formattedPhone = targetPhone.replace(/\+/g, '');

    // Generate deep link
    let deepLink = `https://wa.me/call/${formattedPhone}`;

    // Add payload if provided
    if (payload) {
      const encodedPayload = encodeURIComponent(payload.substring(0, 512));
      deepLink += `?biz_payload=${encodedPayload}`;
    }

    console.log('🔗 Generated call deep link:', deepLink);

    res.json({
      success: true,
      deep_link: deepLink,
      phone_number: formattedPhone,
      payload: payload || null,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deepLink)}`,
    });
  } catch (error: any) {
    console.error('❌ Error generating call deep link:', error);
    res.status(500).json({
      error: 'Failed to generate call deep link',
      details: error.message,
    });
  }
};

/**
 * Send message with call deep link
 */
export const sendCallDeepLinkMessage = async (req: Request, res: Response) => {
  try {
    const { to, message_text, phone_number, payload } = req.body;

    // Validation
    if (!to || !message_text) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'message_text'],
      });
    }

    // Generate deep link
    const targetPhone = phone_number || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const formattedPhone = targetPhone.replace(/\+/g, '');
    
    let deepLink = `https://wa.me/call/${formattedPhone}`;
    if (payload) {
      const encodedPayload = encodeURIComponent(payload.substring(0, 512));
      deepLink += `?biz_payload=${encodedPayload}`;
    }

    // Prepare message with deep link
    const fullMessage = `${message_text}\n\n${deepLink}`;

    const messagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        body: fullMessage,
      },
    };

    console.log('📞 Sending message with call deep link:', { to, deepLink });

    // Send message via WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Message with call deep link sent successfully');

    res.json({
      success: true,
      message: 'Message with call deep link sent successfully',
      message_id: response.data.messages[0].id,
      to: to,
      deep_link: deepLink,
      data: response.data,
    });
  } catch (error: any) {
    console.error('❌ Error sending call deep link message:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to send call deep link message',
      details: error.response?.data || error.message,
    });
  }
};
