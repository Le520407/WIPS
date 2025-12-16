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
 * 获取两步验证状态信息
 */
export const getTwoStepInfo = () => {
  return {
    description: '两步验证为您的 WhatsApp Business 账户添加额外的安全层',
    benefits: [
      '防止未经授权的访问',
      '保护您的业务数据',
      '符合安全最佳实践',
      '增强客户信任'
    ],
    requirements: [
      'PIN 必须是 6 位数字',
      '不要与他人分享您的 PIN',
      '定期更改 PIN 以提高安全性',
      '妥善保管 PIN，丢失后需要联系 Meta 支持'
    ],
    warnings: [
      '⚠️ 如果忘记 PIN，您将无法注册新设备',
      '⚠️ 需要联系 Meta 支持才能重置 PIN',
      '⚠️ 设置 PIN 后，7 天内无法删除'
    ]
  };
};
