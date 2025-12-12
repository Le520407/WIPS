import axios from 'axios';
import ConversationalComponent from '../models/ConversationalComponent';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

interface Command {
  command_name: string;
  command_description: string;
}

interface ConversationalConfig {
  enable_welcome_message?: boolean;
  prompts?: string[];
  commands?: Command[];
}

class ConversationalComponentsService {
  /**
   * Get configuration from Meta API
   */
  async getMetaConfiguration(phoneNumberId: string, accessToken: string) {
    try {
      const response = await axios.get(
        `${GRAPH_API_URL}/${phoneNumberId}`,
        {
          params: {
            fields: 'conversational_automation',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.conversational_automation || null;
    } catch (error: any) {
      console.error('Error fetching conversational automation config:', error.response?.data || error.message);
      throw new Error(`Failed to fetch configuration: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Update configuration on Meta API
   */
  async updateMetaConfiguration(
    phoneNumberId: string,
    accessToken: string,
    config: ConversationalConfig
  ) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/conversational_automation`,
        config,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating conversational automation:', error.response?.data || error.message);
      throw new Error(`Failed to update configuration: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get local configuration from database
   */
  async getLocalConfiguration(userId: string, phoneNumberId: string) {
    const config = await ConversationalComponent.findOne({
      where: { userId, phoneNumberId },
    });

    return config;
  }

  /**
   * Save configuration to database
   */
  async saveLocalConfiguration(
    userId: string,
    phoneNumberId: string,
    config: {
      enableWelcomeMessage?: boolean;
      prompts?: string[];
      commands?: Command[];
      welcomeMessageTemplate?: string;
    }
  ) {
    const [record, created] = await ConversationalComponent.findOrCreate({
      where: { userId, phoneNumberId },
      defaults: {
        userId,
        phoneNumberId,
        enableWelcomeMessage: config.enableWelcomeMessage || false,
        prompts: config.prompts || [],
        commands: config.commands || [],
        welcomeMessageTemplate: config.welcomeMessageTemplate,
      },
    });

    if (!created) {
      await record.update(config);
    }

    return record;
  }

  /**
   * Enable or disable welcome message
   */
  async toggleWelcomeMessage(
    userId: string,
    phoneNumberId: string,
    accessToken: string,
    enable: boolean
  ) {
    // Update Meta API
    await this.updateMetaConfiguration(phoneNumberId, accessToken, {
      enable_welcome_message: enable,
    });

    // Update local database
    const config = await this.saveLocalConfiguration(userId, phoneNumberId, {
      enableWelcomeMessage: enable,
    });

    return config;
  }

  /**
   * Set ice breakers (prompts)
   */
  async setIceBreakers(
    userId: string,
    phoneNumberId: string,
    accessToken: string,
    prompts: string[]
  ) {
    // Validate
    if (prompts.length > 4) {
      throw new Error('Maximum 4 ice breakers allowed');
    }
    prompts.forEach((prompt) => {
      if (prompt.length > 80) {
        throw new Error('Each ice breaker must be 80 characters or less');
      }
    });

    // Update Meta API
    await this.updateMetaConfiguration(phoneNumberId, accessToken, {
      prompts,
    });

    // Update local database
    const config = await this.saveLocalConfiguration(userId, phoneNumberId, {
      prompts,
    });

    return config;
  }

  /**
   * Set commands
   */
  async setCommands(
    userId: string,
    phoneNumberId: string,
    accessToken: string,
    commands: Command[]
  ) {
    // Validate
    if (commands.length > 30) {
      throw new Error('Maximum 30 commands allowed');
    }
    commands.forEach((cmd) => {
      if (!cmd.command_name || !cmd.command_description) {
        throw new Error('Each command must have command_name and command_description');
      }
      if (cmd.command_name.length > 32) {
        throw new Error('Command name must be 32 characters or less');
      }
      if (cmd.command_description.length > 256) {
        throw new Error('Command description must be 256 characters or less');
      }
    });

    // Update Meta API
    await this.updateMetaConfiguration(phoneNumberId, accessToken, {
      commands,
    });

    // Update local database
    const config = await this.saveLocalConfiguration(userId, phoneNumberId, {
      commands,
    });

    return config;
  }

  /**
   * Update all configuration at once
   */
  async updateAllConfiguration(
    userId: string,
    phoneNumberId: string,
    accessToken: string,
    config: {
      enableWelcomeMessage?: boolean;
      prompts?: string[];
      commands?: Command[];
      welcomeMessageTemplate?: string;
    }
  ) {
    // Prepare Meta API payload
    const metaConfig: ConversationalConfig = {};
    if (config.enableWelcomeMessage !== undefined) {
      metaConfig.enable_welcome_message = config.enableWelcomeMessage;
    }
    if (config.prompts !== undefined) {
      metaConfig.prompts = config.prompts;
    }
    if (config.commands !== undefined) {
      metaConfig.commands = config.commands;
    }

    // Update Meta API
    await this.updateMetaConfiguration(phoneNumberId, accessToken, metaConfig);

    // Update local database
    const localConfig = await this.saveLocalConfiguration(userId, phoneNumberId, config);

    return localConfig;
  }

  /**
   * Sync configuration from Meta API to local database
   */
  async syncFromMeta(userId: string, phoneNumberId: string, accessToken: string) {
    const metaConfig = await this.getMetaConfiguration(phoneNumberId, accessToken);

    if (!metaConfig) {
      return null;
    }

    const localConfig = await this.saveLocalConfiguration(userId, phoneNumberId, {
      enableWelcomeMessage: metaConfig.enable_welcome_message || false,
      prompts: metaConfig.prompts || [],
      commands: metaConfig.commands || [],
    });

    return localConfig;
  }
}

export default new ConversationalComponentsService();
