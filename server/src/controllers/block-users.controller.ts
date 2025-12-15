import { Request, Response } from 'express';
import blockUsersService from '../services/block-users.service';

class BlockUsersController {
  /**
   * POST /api/block-users/:phoneNumberId/block
   * Block users
   */
  async blockUsers(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { users, reason } = req.body;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: 'users array is required' });
      }

      // Block users via Meta API
      const metaResponse = await blockUsersService.blockUsers(
        phoneNumberId,
        accessToken,
        users
      );

      // Save successfully blocked users to local database
      const addedUsers = metaResponse.block_users?.added_users || [];
      for (const user of addedUsers) {
        await blockUsersService.saveBlockedUser(
          userId,
          phoneNumberId,
          user.input,
          user.wa_id,
          reason
        );
      }

      res.json({
        success: true,
        meta: metaResponse,
        message: `Blocked ${addedUsers.length} user(s)`,
      });
    } catch (error: any) {
      console.error('Error blocking users:', error);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    }
  }

  /**
   * POST /api/block-users/:phoneNumberId/unblock
   * Unblock users
   */
  async unblockUsers(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { users } = req.body;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: 'users array is required' });
      }

      // Unblock users via Meta API
      const metaResponse = await blockUsersService.unblockUsers(
        phoneNumberId,
        accessToken,
        users
      );

      // Remove from local database
      for (const user of users) {
        await blockUsersService.removeBlockedUser(userId, phoneNumberId, user);
      }

      const addedUsers = metaResponse.block_users?.added_users || [];

      res.json({
        success: true,
        meta: metaResponse,
        message: `Unblocked ${addedUsers.length} user(s)`,
      });
    } catch (error: any) {
      console.error('Error unblocking users:', error);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    }
  }

  /**
   * GET /api/block-users/:phoneNumberId
   * Get blocked users list
   */
  async getBlockedUsers(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { limit, after, before, source = 'local' } = req.query;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      if (source === 'meta') {
        // Get from Meta API - requires access token
        if (!accessToken) {
          return res.status(401).json({ 
            error: 'Access token not found. Please reconnect your WhatsApp account.' 
          });
        }

        const metaData = await blockUsersService.getBlockedUsers(
          phoneNumberId,
          accessToken,
          limit ? parseInt(limit as string) : 100,
          after as string,
          before as string
        );

        res.json({
          source: 'meta',
          data: metaData,
        });
      } else {
        // Get from local database - doesn't require access token
        const localData = await blockUsersService.getLocalBlockedUsers(
          userId,
          phoneNumberId
        );

        res.json({
          source: 'local',
          data: localData,
          total: localData.length,
        });
      }
    } catch (error: any) {
      console.error('Error getting blocked users:', error);
      console.error('Error details:', error.response?.data);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error?.message || error.message || 'Failed to get blocked users',
        details: error.response?.data,
      });
    }
  }

  /**
   * POST /api/block-users/:phoneNumberId/sync
   * Sync blocked users from Meta to local database
   */
  async syncBlockedUsers(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await blockUsersService.syncBlockedUsers(
        userId,
        phoneNumberId,
        accessToken
      );

      res.json({
        success: true,
        ...result,
        message: `Synced ${result.synced} blocked user(s)`,
      });
    } catch (error: any) {
      console.error('Error syncing blocked users:', error);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    }
  }
}

export default new BlockUsersController();
