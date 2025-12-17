import axios from 'axios';

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v21.0';
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * 注册电话号码
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/registration
 */
export const registerPhoneNumber = async (pin: string): Promise<any> => {
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
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/register`,
      {
        messaging_product: 'whatsapp',
        pin: pin
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Phone number registered successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Register phone number error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to register phone number');
  }
};

/**
 * 注销电话号码
 */
export const deregisterPhoneNumber = async (): Promise<any> => {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('Missing PHONE_NUMBER_ID or ACCESS_TOKEN');
  }

  try {
    const response = await axios.delete(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/deregister`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Phone number deregistered successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Deregister phone number error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to deregister phone number');
  }
};

/**
 * 请求验证码
 * @param codeMethod - SMS or VOICE
 * @param language - Language code (e.g., 'en_US', 'zh_CN')
 */
export const requestVerificationCode = async (
  codeMethod: 'SMS' | 'VOICE' = 'SMS',
  language: string = 'en_US'
): Promise<any> => {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('Missing PHONE_NUMBER_ID or ACCESS_TOKEN');
  }

  try {
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/request_code`,
      {
        code_method: codeMethod,
        language: language
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Verification code requested via ${codeMethod}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Request verification code error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to request verification code');
  }
};

/**
 * 验证验证码
 * @param code - 6-digit verification code
 */
export const verifyCode = async (code: string): Promise<any> => {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('Missing PHONE_NUMBER_ID or ACCESS_TOKEN');
  }

  // 验证码格式验证
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Verification code must be exactly 6 digits');
  }

  try {
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/verify_code`,
      {
        code: code
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Verification code verified successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Verify code error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to verify code');
  }
};

/**
 * Get registration information
 */
export const getRegistrationInfo = () => {
  return {
    description: 'Phone number registration allows you to connect your WhatsApp Business phone number to your application',
    steps: [
      {
        step: 1,
        title: 'Request Verification Code',
        description: 'Choose to receive verification code via SMS or Voice'
      },
      {
        step: 2,
        title: 'Enter Verification Code',
        description: 'Enter the 6-digit verification code you received'
      },
      {
        step: 3,
        title: 'Set PIN',
        description: 'Set a 6-digit PIN for two-step verification'
      },
      {
        step: 4,
        title: 'Complete Registration',
        description: 'Complete phone number registration using the PIN'
      }
    ],
    requirements: [
      'You must own the phone number',
      'Phone number must be able to receive SMS or voice calls',
      'Two-step verification PIN is required',
      'Phone number cannot already be in use by another WhatsApp Business account'
    ],
    warnings: [
      '⚠️ Registration will deregister the phone number from other devices',
      '⚠️ Make sure you have access to the phone number',
      '⚠️ Deregistration will disconnect all existing connections',
      '⚠️ Re-registration is required after deregistration'
    ],
    languages: [
      { code: 'en_US', name: 'English (US)' },
      { code: 'zh_CN', name: '简体中文' },
      { code: 'zh_HK', name: '繁體中文 (香港)' },
      { code: 'zh_TW', name: '繁體中文 (台灣)' },
      { code: 'es_ES', name: 'Español' },
      { code: 'fr_FR', name: 'Français' },
      { code: 'de_DE', name: 'Deutsch' },
      { code: 'ja_JP', name: '日本語' },
      { code: 'ko_KR', name: '한국어' },
      { code: 'pt_BR', name: 'Português (Brasil)' }
    ]
  };
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
 * 验证验证码格式
 */
export const validateVerificationCode = (code: string): { valid: boolean; error?: string } => {
  if (!code) {
    return { valid: false, error: 'Verification code is required' };
  }

  if (code.length !== 6) {
    return { valid: false, error: 'Verification code must be exactly 6 digits' };
  }

  if (!/^\d+$/.test(code)) {
    return { valid: false, error: 'Verification code must contain only numbers' };
  }

  return { valid: true };
};
