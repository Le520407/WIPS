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
 * 获取注册信息
 */
export const getRegistrationInfo = () => {
  return {
    description: '电话号码注册允许您将 WhatsApp Business 电话号码连接到您的应用',
    steps: [
      {
        step: 1,
        title: '请求验证码',
        description: '选择通过 SMS 或语音接收验证码'
      },
      {
        step: 2,
        title: '输入验证码',
        description: '输入收到的 6 位验证码'
      },
      {
        step: 3,
        title: '设置 PIN',
        description: '设置 6 位 PIN 码用于两步验证'
      },
      {
        step: 4,
        title: '完成注册',
        description: '使用 PIN 完成电话号码注册'
      }
    ],
    requirements: [
      '您必须拥有该电话号码',
      '电话号码必须能够接收 SMS 或语音呼叫',
      '需要设置两步验证 PIN',
      '电话号码不能已在其他 WhatsApp Business 账户中使用'
    ],
    warnings: [
      '⚠️ 注册会将电话号码从其他设备上注销',
      '⚠️ 确保您有权访问该电话号码',
      '⚠️ 注销会断开所有现有连接',
      '⚠️ 注销后需要重新注册才能使用'
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
