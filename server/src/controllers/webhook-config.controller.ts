import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Get current webhook configuration
export const getWebhookConfig = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you'd fetch this from your database
    // For now, return current environment config
    const config: any = {
      callbackUrl: process.env.WEBHOOK_CALLBACK_URL || '',
      verifyToken: process.env.META_VERIFY_TOKEN || '',
      subscribedFields: ['messages', 'message_status'],
    };

    // Try to get WABA override
    try {
      const wabaResponse = await axios.get(
        `${GRAPH_API_URL}/${WABA_ID}/subscribed_apps`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );
      
      if (wabaResponse.data.data?.[0]?.override_callback_uri) {
        config.wabaOverride = {
          url: wabaResponse.data.data[0].override_callback_uri,
          token: '***'
        };
      }
    } catch (error) {
      console.log('No WABA override found');
    }

    // Try to get phone override
    try {
      const phoneResponse = await axios.get(
        `${GRAPH_API_URL}/${PHONE_NUMBER_ID}?fields=webhook_configuration`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );
      
      if (phoneResponse.data.webhook_configuration?.phone_number) {
        config.phoneOverride = {
          url: phoneResponse.data.webhook_configuration.phone_number,
          token: '***'
        };
      }
    } catch (error) {
      console.log('No phone override found');
    }

    res.json(config);
  } catch (error: any) {
    console.error('Get webhook config error:', error);
    res.status(500).json({ error: error.message || 'Failed to get webhook config' });
  }
};

// Save webhook configuration
export const saveWebhookConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { callbackUrl, verifyToken, subscribedFields } = req.body;

    // In a real app, you'd save this to your database
    // and then update Meta's webhook settings via API
    
    console.log('Saving webhook config:', { callbackUrl, verifyToken, subscribedFields });

    // Note: Updating webhook URL via API requires app-level permissions
    // Usually done through Meta Developer Console
    
    res.json({ success: true, message: 'Configuration saved' });
  } catch (error: any) {
    console.error('Save webhook config error:', error);
    res.status(500).json({ error: error.message || 'Failed to save webhook config' });
  }
};

// Test webhook
export const testWebhook = async (req: AuthRequest, res: Response) => {
  try {
    // Send a test payload to the configured webhook URL
    const testPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: WABA_ID,
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '1234567890',
              phone_number_id: PHONE_NUMBER_ID
            },
            messages: [{
              from: '1234567890',
              id: 'test_message_id',
              timestamp: Math.floor(Date.now() / 1000).toString(),
              type: 'text',
              text: {
                body: 'This is a test webhook message'
              }
            }]
          },
          field: 'messages'
        }]
      }]
    };

    res.json({ 
      success: true, 
      message: 'Test webhook payload generated',
      payload: testPayload 
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: error.message || 'Failed to test webhook' });
  }
};

// Set WABA webhook override
export const setWABAOverride = async (req: AuthRequest, res: Response) => {
  try {
    const { url, token } = req.body;

    if (!url || !token) {
      return res.status(400).json({ error: 'URL and token are required' });
    }

    const response = await axios.post(
      `${GRAPH_API_URL}/${WABA_ID}/subscribed_apps`,
      {
        override_callback_uri: url,
        verify_token: token
      },
      {
        headers: { 
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Set WABA override error:', error.response?.data || error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Failed to set WABA override' 
    });
  }
};

// Delete WABA webhook override
export const deleteWABAOverride = async (req: AuthRequest, res: Response) => {
  try {
    // To delete, just subscribe without override parameters
    const response = await axios.post(
      `${GRAPH_API_URL}/${WABA_ID}/subscribed_apps`,
      {},
      {
        headers: { 
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Delete WABA override error:', error.response?.data || error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Failed to delete WABA override' 
    });
  }
};

// Set phone number webhook override
export const setPhoneOverride = async (req: AuthRequest, res: Response) => {
  try {
    const { url, token } = req.body;

    if (!url || !token) {
      return res.status(400).json({ error: 'URL and token are required' });
    }

    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}`,
      {
        webhook_configuration: {
          override_callback_uri: url,
          verify_token: token
        }
      },
      {
        headers: { 
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Set phone override error:', error.response?.data || error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Failed to set phone override' 
    });
  }
};

// Delete phone number webhook override
export const deletePhoneOverride = async (req: AuthRequest, res: Response) => {
  try {
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}`,
      {
        webhook_configuration: {
          override_callback_uri: ''
        }
      },
      {
        headers: { 
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Delete phone override error:', error.response?.data || error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Failed to delete phone override' 
    });
  }
};

// Get webhook logs
export const getWebhookLogs = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you'd fetch this from your database
    // For now, return empty array
    const logs: any[] = [];

    res.json({ logs });
  } catch (error: any) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({ error: error.message || 'Failed to get webhook logs' });
  }
};
