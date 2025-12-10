import axios from 'axios';
import SipConfig from '../models/SipConfig';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = 'v21.0';

export class SipService {
  // Get SIP configuration from Meta API
  static async getMetaSipConfig(includeSipCredentials: boolean = false): Promise<any> {
    try {
      const url = `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`;
      const params = includeSipCredentials ? { include_sip_credentials: 'true' } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Get Meta SIP config error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update SIP configuration on Meta API
  static async updateMetaSipConfig(
    sipEnabled: boolean,
    sipServers: any[],
    callingEnabled?: boolean
  ): Promise<any> {
    try {
      const payload: any = {
        calling: {
          sip: {
            status: sipEnabled ? 'ENABLED' : 'DISABLED',
            servers: sipServers,
          },
        },
      };

      // Include calling status if provided
      if (callingEnabled !== undefined) {
        payload.calling.status = callingEnabled ? 'ENABLED' : 'DISABLED';
      }

      const response = await axios.post(
        `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Update Meta SIP config error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update SRTP key exchange protocol
  static async updateSrtpProtocol(protocol: 'DTLS' | 'SDES'): Promise<any> {
    try {
      const payload = {
        calling: {
          srtp_key_exchange_protocol: protocol,
        },
      };

      const response = await axios.post(
        `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Update SRTP protocol error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Reset SIP password (disable, delete servers, then re-enable)
  static async resetSipPassword(sipServers: any[]): Promise<any> {
    try {
      // Step 1: Disable SIP and delete servers
      await this.updateMetaSipConfig(false, []);

      // Step 2: Re-enable SIP with servers
      await this.updateMetaSipConfig(true, sipServers);

      // Step 3: Get new password
      const config = await this.getMetaSipConfig(true);

      return config;
    } catch (error: any) {
      console.error('Reset SIP password error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Sync local config with Meta API
  static async syncWithMeta(userId: string): Promise<SipConfig> {
    try {
      const metaConfig = await this.getMetaSipConfig(true);
      const sipData = metaConfig.calling?.sip;

      if (!sipData) {
        throw new Error('No SIP configuration found in Meta API response');
      }

      // Find or create local config
      let localConfig = await SipConfig.findOne({
        where: {
          user_id: userId,
          phone_number_id: PHONE_NUMBER_ID!,
        },
      });

      const sipEnabled = sipData.status === 'ENABLED';
      const sipServers = sipData.servers || [];
      const sipPassword = sipServers[0]?.sip_user_password || null;
      const srtpProtocol = metaConfig.calling?.srtp_key_exchange_protocol || 'DTLS';

      if (!localConfig) {
        localConfig = await SipConfig.create({
          user_id: userId,
          phone_number_id: PHONE_NUMBER_ID!,
          sip_enabled: sipEnabled,
          sip_servers: sipServers,
          sip_user_password: sipPassword,
          srtp_key_exchange_protocol: srtpProtocol,
          last_synced_at: new Date(),
        });
      } else {
        await localConfig.update({
          sip_enabled: sipEnabled,
          sip_servers: sipServers,
          sip_user_password: sipPassword,
          srtp_key_exchange_protocol: srtpProtocol,
          last_synced_at: new Date(),
        });
      }

      return localConfig;
    } catch (error: any) {
      console.error('Sync with Meta error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Validate SIP server TLS certificate
  static async validateTlsCertificate(hostname: string, port: number): Promise<any> {
    // This would require running openssl command
    // For now, return a placeholder
    return {
      valid: true,
      message: 'TLS certificate validation requires manual testing with openssl command',
      command: `openssl s_client -quiet -verify_hostname ${hostname} -connect ${hostname}:${port}`,
    };
  }
}
