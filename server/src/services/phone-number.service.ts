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
 * Get phone number status
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

    // Parse throughput level
    let throughputLevel: 'STANDARD' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN' = 'UNKNOWN';
    let throughputLimit: number | undefined;

    if (data.throughput) {
      throughputLevel = data.throughput.level || 'UNKNOWN';
      
      // Set limit based on level (messages per second)
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
 * Get quality rating color and description
 */
export const getQualityRatingInfo = (rating: string) => {
  switch (rating) {
    case 'GREEN':
      return {
        color: 'green',
        label: 'Excellent',
        description: 'Phone number quality is good, no restrictions'
      };
    case 'YELLOW':
      return {
        color: 'yellow',
        label: 'Warning',
        description: 'Phone number quality is average, may have minor restrictions'
      };
    case 'RED':
      return {
        color: 'red',
        label: 'Poor',
        description: 'Phone number quality is poor, has severe restrictions'
      };
    default:
      return {
        color: 'gray',
        label: 'Unknown',
        description: 'Unable to retrieve quality rating'
      };
  }
};

/**
 * Get connection status description
 */
export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'CONNECTED':
      return {
        color: 'green',
        label: 'Connected',
        description: 'Phone number is working normally'
      };
    case 'DISCONNECTED':
      return {
        color: 'red',
        label: 'Disconnected',
        description: 'Phone number is not connected'
      };
    case 'FLAGGED':
      return {
        color: 'orange',
        label: 'Flagged',
        description: 'Phone number is flagged, may have issues'
      };
    case 'RESTRICTED':
      return {
        color: 'red',
        label: 'Restricted',
        description: 'Phone number is restricted'
      };
    default:
      return {
        color: 'gray',
        label: 'Unknown',
        description: 'Unable to retrieve connection status'
      };
  }
};

/**
 * Get throughput level description
 */
export const getThroughputInfo = (level: string, limit?: number) => {
  switch (level) {
    case 'STANDARD':
      return {
        color: 'blue',
        label: 'Standard',
        description: `Up to ${limit || 80} messages per second`,
        limit: limit || 80
      };
    case 'HIGH':
      return {
        color: 'green',
        label: 'High',
        description: `Up to ${limit || 200} messages per second`,
        limit: limit || 200
      };
    case 'VERY_HIGH':
      return {
        color: 'purple',
        label: 'Very High',
        description: `Up to ${limit || 1000} messages per second`,
        limit: limit || 1000
      };
    default:
      return {
        color: 'gray',
        label: 'Unknown',
        description: 'Unable to retrieve throughput information',
        limit: undefined
      };
  }
};
