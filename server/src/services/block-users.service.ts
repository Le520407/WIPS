import axios from 'axios';
import BlockedUser from '../models/BlockedUser';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';

class BlockUsersService {
  /**
   * Block users via Meta API
   */
  async blockUsers(
    phoneNumberId: string,
    accessToken: string,
    users: string[]
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${API_VERSION}/${phoneNumberId}/block_users`,
        {
          messaging_product: 'whatsapp',
          block_users: users.map(user => ({ user })),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error blocking users:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Unblock users via Meta API
   */
  async unblockUsers(
    phoneNumberId: string,
    accessToken: string,
    users: string[]
  ): Promise<any> {
    try {
      const response = await axios.delete(
        `${WHATSAPP_API_URL}/${API_VERSION}/${phoneNumberId}/block_users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            block_users: users.map(user => ({ user })),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error unblocking users:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get blocked users list from Meta API
   */
  async getBlockedUsers(
    phoneNumberId: string,
    accessToken: string,
    limit: number = 100,
    after?: string,
    before?: string
  ): Promise<any> {
    try {
      const params: any = { limit };
      if (after) params.after = after;
      if (before) params.before = before;

      const response = await axios.get(
        `${WHATSAPP_API_URL}/${API_VERSION}/${phoneNumberId}/block_users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting blocked users:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Save blocked user to local database
   */
  async saveBlockedUser(
    userId: string,
    phoneNumberId: string,
    blockedPhoneNumber: string,
    waId: string,
    reason?: string
  ): Promise<BlockedUser> {
    return await BlockedUser.create({
      userId,
      phoneNumberId,
      blockedPhoneNumber,
      waId,
      reason,
      blockedAt: new Date(),
    });
  }

  /**
   * Remove blocked user from local database
   */
  async removeBlockedUser(
    userId: string,
    phoneNumberId: string,
    phoneNumber: string
  ): Promise<number> {
    return await BlockedUser.destroy({
      where: {
        userId,
        phoneNumberId,
        blockedPhoneNumber: phoneNumber,
      },
    });
  }

  /**
   * Get local blocked users list
   */
  async getLocalBlockedUsers(
    userId: string,
    phoneNumberId: string
  ): Promise<BlockedUser[]> {
    return await BlockedUser.findAll({
      where: {
        userId,
        phoneNumberId,
      },
      order: [['blockedAt', 'DESC']],
    });
  }

  /**
   * Sync blocked users from Meta to local database
   */
  async syncBlockedUsers(
    userId: string,
    phoneNumberId: string,
    accessToken: string
  ): Promise<{ synced: number; total: number }> {
    try {
      // Get all blocked users from Meta
      const metaData = await this.getBlockedUsers(phoneNumberId, accessToken, 1000);
      
      const blockedUsers = metaData.data?.[0]?.block_users || [];
      
      // Clear existing records
      await BlockedUser.destroy({
        where: { userId, phoneNumberId },
      });

      // Save new records
      let synced = 0;
      for (const user of blockedUsers) {
        await this.saveBlockedUser(
          userId,
          phoneNumberId,
          user.input,
          user.wa_id
        );
        synced++;
      }

      return { synced, total: blockedUsers.length };
    } catch (error: any) {
      console.error('Error syncing blocked users:', error);
      throw error;
    }
  }
}

export default new BlockUsersService();
