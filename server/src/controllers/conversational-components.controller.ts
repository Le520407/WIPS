import { Request, Response } from 'express';
import conversationalComponentsService from '../services/conversational-components.service';

class ConversationalComponentsController {
  /**
   * GET /api/conversational-components/:phoneNumberId
   * Get current configuration
   */
  async getConfiguration(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      console.log('🔍 getConfiguration - Debug:', {
        hasUser: !!(req as any).user,
        userId,
        hasAccessToken: !!accessToken,
        user: (req as any).user
      });

      if (!userId || !accessToken) {
        console.log('❌ Unauthorized: Missing userId or accessToken');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get local configuration
      const localConfig = await conversationalComponentsService.getLocalConfiguration(
        userId,
        phoneNumberId
      );

      // Also fetch from Meta API to ensure sync
      try {
        const metaConfig = await conversationalComponentsService.getMetaConfiguration(
          phoneNumberId,
          accessToken
        );

        return res.json({
          local: localConfig,
          meta: metaConfig,
          synced: localConfig !== null,
        });
      } catch (error) {
        // If Meta API fails, return local config only
        return res.json({
          local: localConfig,
          meta: null,
          synced: false,
          warning: 'Could not fetch from Meta API',
        });
      }
    } catch (error: any) {
      console.error('Error getting conversational components:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/conversational-components/:phoneNumberId/welcome
   * Enable/disable welcome message
   */
  async toggleWelcomeMessage(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { enable } = req.body;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (typeof enable !== 'boolean') {
        return res.status(400).json({ error: 'enable must be a boolean' });
      }

      const config = await conversationalComponentsService.toggleWelcomeMessage(
        userId,
        phoneNumberId,
        accessToken,
        enable
      );

      res.json({
        success: true,
        config,
        message: `Welcome message ${enable ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      console.error('Error toggling welcome message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/conversational-components/:phoneNumberId/ice-breakers
   * Set ice breakers
   */
  async setIceBreakers(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { prompts } = req.body;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!Array.isArray(prompts)) {
        return res.status(400).json({ error: 'prompts must be an array' });
      }

      const config = await conversationalComponentsService.setIceBreakers(
        userId,
        phoneNumberId,
        accessToken,
        prompts
      );

      res.json({
        success: true,
        config,
        message: 'Ice breakers updated',
      });
    } catch (error: any) {
      console.error('Error setting ice breakers:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/conversational-components/:phoneNumberId/commands
   * Set commands
   */
  async setCommands(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { commands } = req.body;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!Array.isArray(commands)) {
        return res.status(400).json({ error: 'commands must be an array' });
      }

      const config = await conversationalComponentsService.setCommands(
        userId,
        phoneNumberId,
        accessToken,
        commands
      );

      res.json({
        success: true,
        config,
        message: 'Commands updated',
      });
    } catch (error: any) {
      console.error('Error setting commands:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/conversational-components/:phoneNumberId
   * Update all configuration at once
   */
  async updateConfiguration(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const { enableWelcomeMessage, prompts, commands, welcomeMessageTemplate } = req.body;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const config = await conversationalComponentsService.updateAllConfiguration(
        userId,
        phoneNumberId,
        accessToken,
        {
          enableWelcomeMessage,
          prompts,
          commands,
          welcomeMessageTemplate,
        }
      );

      res.json({
        success: true,
        config,
        message: 'Configuration updated',
      });
    } catch (error: any) {
      console.error('Error updating configuration:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/conversational-components/:phoneNumberId/sync
   * Sync configuration from Meta API
   */
  async syncFromMeta(req: Request, res: Response) {
    try {
      const { phoneNumberId } = req.params;
      const userId = (req as any).user?.id;
      const accessToken = (req as any).user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const config = await conversationalComponentsService.syncFromMeta(
        userId,
        phoneNumberId,
        accessToken
      );

      res.json({
        success: true,
        config,
        message: 'Configuration synced from Meta',
      });
    } catch (error: any) {
      console.error('Error syncing from Meta:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ConversationalComponentsController();
