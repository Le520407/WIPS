import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import SipConfig from '../models/SipConfig';
import { SipService } from '../services/sip.service';

// Get SIP configuration
export const getSipConfig = async (req: AuthRequest, res: Response) => {
  try {
    const includePassword = req.query.include_password === 'true';

    let config = await SipConfig.findOne({
      where: {
        user_id: req.user!.id,
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      },
    });

    // If no local config, try to sync from Meta
    if (!config) {
      try {
        config = await SipService.syncWithMeta(req.user!.id);
      } catch (syncError) {
        console.error('Failed to sync from Meta:', syncError);
        // Create default config
        config = await SipConfig.create({
          user_id: req.user!.id,
          phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
          sip_enabled: false,
          sip_servers: [],
          srtp_key_exchange_protocol: 'DTLS',
        });
      }
    }

    const configData = config.toJSON();

    // Hide password unless explicitly requested
    if (!includePassword) {
      delete configData.sip_user_password;
    }

    res.json({
      config: configData,
      meta_sync_status: config.last_synced_at ? 'synced' : 'not_synced',
    });
  } catch (error) {
    console.error('Get SIP config error:', error);
    res.status(500).json({ error: 'Failed to get SIP configuration' });
  }
};

// Update SIP configuration
export const updateSipConfig = async (req: AuthRequest, res: Response) => {
  try {
    const {
      sip_enabled,
      sip_servers,
      srtp_key_exchange_protocol,
      calling_enabled,
    } = req.body;

    // Validate servers format
    if (sip_servers && !Array.isArray(sip_servers)) {
      return res.status(400).json({ error: 'sip_servers must be an array' });
    }

    // Validate server structure
    if (sip_servers && sip_servers.length > 0) {
      for (const server of sip_servers) {
        if (!server.hostname) {
          return res.status(400).json({ error: 'Server hostname is required' });
        }
        if (!server.port) {
          server.port = 5061; // Default TLS port
        }
        // Validate request_uri_user_params if provided
        if (server.request_uri_user_params) {
          for (const [key, value] of Object.entries(server.request_uri_user_params)) {
            if (key.length > 128 || (value as string).length > 128) {
              return res.status(400).json({
                error: 'request_uri_user_params key/value must be <= 128 characters',
              });
            }
          }
        }
      }
    }

    // Get or create local config
    let config = await SipConfig.findOne({
      where: {
        user_id: req.user!.id,
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      },
    });

    if (!config) {
      config = await SipConfig.create({
        user_id: req.user!.id,
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
        sip_enabled: false,
        sip_servers: [],
        srtp_key_exchange_protocol: 'DTLS',
      });
    }

    // Prepare Meta API servers format (remove password if present)
    const metaServers = (sip_servers || config.sip_servers).map((server: any) => {
      const { sip_user_password, ...serverWithoutPassword } = server;
      return serverWithoutPassword;
    });

    // Update Meta API
    try {
      await SipService.updateMetaSipConfig(
        sip_enabled ?? config.sip_enabled,
        metaServers,
        calling_enabled
      );

      // Update SRTP protocol if provided
      if (srtp_key_exchange_protocol && srtp_key_exchange_protocol !== config.srtp_key_exchange_protocol) {
        await SipService.updateSrtpProtocol(srtp_key_exchange_protocol);
      }

      // Sync back from Meta to get updated config with password
      const updatedConfig = await SipService.syncWithMeta(req.user!.id);

      res.json({
        success: true,
        config: updatedConfig.toJSON(),
        message: 'SIP configuration updated successfully',
        warning: sip_enabled
          ? 'When SIP is enabled, Graph API calling endpoints and webhooks are disabled'
          : null,
      });
    } catch (metaError: any) {
      console.error('Meta API error:', metaError.response?.data || metaError.message);
      res.status(500).json({
        error: 'Failed to update SIP configuration on Meta API',
        details: metaError.response?.data || metaError.message,
      });
    }
  } catch (error) {
    console.error('Update SIP config error:', error);
    res.status(500).json({ error: 'Failed to update SIP configuration' });
  }
};

// Get SIP password
export const getSipPassword = async (req: AuthRequest, res: Response) => {
  try {
    // Always fetch fresh from Meta API
    const metaConfig = await SipService.getMetaSipConfig(true);
    const sipData = metaConfig.calling?.sip;

    if (!sipData || !sipData.servers || sipData.servers.length === 0) {
      return res.status(404).json({
        error: 'No SIP servers configured',
        message: 'Please configure SIP servers first',
      });
    }

    const password = sipData.servers[0]?.sip_user_password;

    if (!password) {
      return res.status(404).json({
        error: 'SIP password not found',
        message: 'Password may not be generated yet',
      });
    }

    // Update local config
    await SipConfig.update(
      { sip_user_password: password },
      {
        where: {
          user_id: req.user!.id,
          phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
        },
      }
    );

    res.json({
      sip_user_password: password,
      phone_number: process.env.WHATSAPP_PHONE_NUMBER_ID,
      sip_domain: 'wa.meta.vc',
      username: process.env.WHATSAPP_PHONE_NUMBER_ID?.replace('+', ''),
      message: 'Use this password for SIP digest authentication',
    });
  } catch (error: any) {
    console.error('Get SIP password error:', error);
    res.status(500).json({
      error: 'Failed to get SIP password',
      details: error.response?.data || error.message,
    });
  }
};

// Reset SIP password
export const resetSipPassword = async (req: AuthRequest, res: Response) => {
  try {
    const config = await SipConfig.findOne({
      where: {
        user_id: req.user!.id,
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      },
    });

    if (!config || config.sip_servers.length === 0) {
      return res.status(400).json({
        error: 'No SIP servers configured',
        message: 'Please configure SIP servers before resetting password',
      });
    }

    // Prepare servers without password
    const servers = config.sip_servers.map((server: any) => {
      const { sip_user_password, ...serverWithoutPassword } = server;
      return serverWithoutPassword;
    });

    // Reset password via Meta API
    const newConfig = await SipService.resetSipPassword(servers);

    // Sync with local database
    const updatedConfig = await SipService.syncWithMeta(req.user!.id);

    res.json({
      success: true,
      message: 'SIP password reset successfully',
      new_password: updatedConfig.sip_user_password,
      config: updatedConfig.toJSON(),
    });
  } catch (error: any) {
    console.error('Reset SIP password error:', error);
    res.status(500).json({
      error: 'Failed to reset SIP password',
      details: error.response?.data || error.message,
    });
  }
};

// Sync with Meta API
export const syncWithMeta = async (req: AuthRequest, res: Response) => {
  try {
    const config = await SipService.syncWithMeta(req.user!.id);

    res.json({
      success: true,
      message: 'Synced with Meta API successfully',
      config: config.toJSON(),
      synced_at: config.last_synced_at,
    });
  } catch (error: any) {
    console.error('Sync with Meta error:', error);
    res.status(500).json({
      error: 'Failed to sync with Meta API',
      details: error.response?.data || error.message,
    });
  }
};

// Validate TLS certificate
export const validateTlsCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { hostname, port } = req.body;

    if (!hostname) {
      return res.status(400).json({ error: 'Hostname is required' });
    }

    const result = await SipService.validateTlsCertificate(
      hostname,
      port || 5061
    );

    res.json(result);
  } catch (error) {
    console.error('Validate TLS certificate error:', error);
    res.status(500).json({ error: 'Failed to validate TLS certificate' });
  }
};

// Get SIP status and statistics
export const getSipStatus = async (req: AuthRequest, res: Response) => {
  try {
    const config = await SipConfig.findOne({
      where: {
        user_id: req.user!.id,
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      },
    });

    if (!config) {
      return res.json({
        configured: false,
        enabled: false,
        message: 'SIP not configured',
      });
    }

    const status = {
      configured: config.sip_servers.length > 0,
      enabled: config.sip_enabled,
      server_count: config.sip_servers.length,
      servers: config.sip_servers.map((s: any) => ({
        hostname: s.hostname,
        port: s.port,
      })),
      srtp_protocol: config.srtp_key_exchange_protocol,
      last_synced: config.last_synced_at,
      has_password: !!config.sip_user_password,
      sip_domain: 'wa.meta.vc',
      warning: config.sip_enabled
        ? 'SIP is enabled. Graph API calling endpoints and webhooks are disabled.'
        : null,
    };

    res.json(status);
  } catch (error) {
    console.error('Get SIP status error:', error);
    res.status(500).json({ error: 'Failed to get SIP status' });
  }
};
