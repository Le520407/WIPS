import axios from 'axios';

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v21.0';
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface PhoneNumberStatus {
  phone_number: string;
  display_phone_number: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  status: 'CONNECTED' | 'DISCONNECTED' | 'FLAGGED' | 'RESTRICTED' | 'UNKNOWN';
  throughput: {
    level: 'STANDARD' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
    limit?: number;
  };
  verified_name?: string;
  code_verification_status?: string;
  messaging_limit_tier?: string;
  name_status?: 'APPROVED' | 'AVAILABLE_WITHOUT_REVIEW' | 'DECLINED' | 'EXPIRED' | 'PENDING_REVIEW' | 'NONE';
}

/**
 * 获取电话号码状态
 */
export const getPhoneNumberStatus = async (): Promise<PhoneNumberStatus> => {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('Missing PHONE_NUMBER_ID or ACCESS_TOKEN');
  }

  try {
    const response = await axios.get(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}`,
      {
        params: {
          fields: 'quality_rating,status,throughput,verified_name,display_phone_number,code_verification_status,messaging_limit_tier,name_status'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const data = response.data;

    // 解析吞吐量级别
    let throughputLevel: 'STANDARD' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN' = 'UNKNOWN';
    let throughputLimit: number | undefined;

    if (data.throughput) {
      throughputLevel = data.throughput.level || 'UNKNOWN';
      
      // 根据级别设置限制（每秒消息数）
      switch (throughputLevel) {
        case 'STANDARD':
          throughputLimit = 80;
          break;
        case 'HIGH':
          throughputLimit = 200;
          break;
        case 'VERY_HIGH':
          throughputLimit = 1000;
          break;
        default:
          throughputLimit = undefined;
      }
    }

    return {
      phone_number: data.id || PHONE_NUMBER_ID,
      display_phone_number: data.display_phone_number || '',
      quality_rating: data.quality_rating || 'UNKNOWN',
      status: data.status || 'UNKNOWN',
      throughput: {
        level: throughputLevel,
        limit: throughputLimit
      },
      verified_name: data.verified_name,
      code_verification_status: data.code_verification_status,
      messaging_limit_tier: data.messaging_limit_tier,
      name_status: data.name_status
    };
  } catch (error: any) {
    console.error('Get phone number status error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get phone number status');
  }
};

/**
 * 获取质量评级的颜色和描述
 */
export const getQualityRatingInfo = (rating: string) => {
  switch (rating) {
    case 'GREEN':
      return {
        color: 'green',
        label: '优秀',
        description: '电话号码质量良好，没有限制'
      };
    case 'YELLOW':
      return {
        color: 'yellow',
        label: '警告',
        description: '电话号码质量一般，可能有轻微限制'
      };
    case 'RED':
      return {
        color: 'red',
        label: '差',
        description: '电话号码质量差，有严重限制'
      };
    default:
      return {
        color: 'gray',
        label: '未知',
        description: '无法获取质量评级'
      };
  }
};

/**
 * 获取连接状态的描述
 */
export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'CONNECTED':
      return {
        color: 'green',
        label: '已连接',
        description: '电话号码正常工作'
      };
    case 'DISCONNECTED':
      return {
        color: 'red',
        label: '已断开',
        description: '电话号码未连接'
      };
    case 'FLAGGED':
      return {
        color: 'orange',
        label: '已标记',
        description: '电话号码被标记，可能有问题'
      };
    case 'RESTRICTED':
      return {
        color: 'red',
        label: '受限',
        description: '电话号码受到限制'
      };
    default:
      return {
        color: 'gray',
        label: '未知',
        description: '无法获取连接状态'
      };
  }
};

/**
 * 获取吞吐量级别的描述
 */
export const getThroughputInfo = (level: string, limit?: number) => {
  switch (level) {
    case 'STANDARD':
      return {
        color: 'blue',
        label: '标准',
        description: `每秒最多 ${limit || 80} 条消息`,
        limit: limit || 80
      };
    case 'HIGH':
      return {
        color: 'green',
        label: '高',
        description: `每秒最多 ${limit || 200} 条消息`,
        limit: limit || 200
      };
    case 'VERY_HIGH':
      return {
        color: 'purple',
        label: '非常高',
        description: `每秒最多 ${limit || 1000} 条消息`,
        limit: limit || 1000
      };
    default:
      return {
        color: 'gray',
        label: '未知',
        description: '无法获取吞吐量信息',
        limit: undefined
      };
  }
};
