import axios from 'axios';

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v21.0';
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * 设置两步验证 PIN
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/two-step-verification
 */
export const setTwoStepPin = async (pin: string): Promise<any> => {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('Missing PHONE_NUMBER_ID or ACCESS_TOKEN');
  }

  // 验证 PIN 格式 (6位数字)
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be exactly 6 digits');
  }

  try {
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/settings/two_step`,
      {
        pin: pin
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Two-step verification PIN set successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Set two-step PIN error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to set two-step verification PIN');
  }
};

/**
 * 删除两步验证 PIN
 */
export const removeTwoStepPin = async (): Promise<any> => {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('Missing PHONE_NUMBER_ID or ACCESS_TOKEN');
  }

  try {
    const response = await axios.delete(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/settings/two_step`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Two-step verification PIN removed successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Remove two-step PIN error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to remove two-step verification PIN');
  }
};

/**
 * 验证 PIN 格式
 */
export const validatePin = (pin: string): { valid: boolean; error?: string } => {
  if (!pin) {
    return { valid: false, error: 'PIN is required' };
  }

  if (pin.length !== 6) {
    return { valid: false, error: 'PIN must be exactly 6 digits' };
  }

  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: 'PIN must contain only numbers' };
  }

  return { valid: true };
};

/**
 * Get two-step verification status information
 */
export const getTwoStepInfo = () => {
  return {
    description: 'Two-step verification adds an extra layer of security to your WhatsApp Business account',
    benefits: [
      'Prevent unauthorized access',
      'Protect your business data',
      'Comply with security best practices',
      'Enhance customer trust'
    ],
    requirements: [
      'PIN must be exactly 6 digits',
      'Do not share your PIN with others',
      'Change your PIN regularly for better security',
      'Keep your PIN safe - you will need to contact Meta support if lost'
    ],
    warnings: [
      '⚠️ If you forget your PIN, you will not be able to register new devices',
      '⚠️ You will need to contact Meta support to reset your PIN',
      '⚠️ After setting a PIN, it cannot be removed for 7 days'
    ]
  };
};
