import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import authTemplateService from '../services/auth-template.service';
import User from '../models/User';

/**
 * Create authentication template
 */
export async function createAuthTemplate(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's credentials
    const user = await User.findByPk(user_id);
    if (!user || !user.access_token || !user.waba_id) {
      return res.status(400).json({ error: 'User credentials not found' });
    }

    const {
      name,
      language,
      otp_type,
      add_security_recommendation,
      code_expiration_minutes,
      button_text,
      autofill_text,
      package_name,
      signature_hash,
      message_send_ttl_seconds,
    } = req.body;

    // Validation
    if (!name || !language || !otp_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, language, otp_type' 
      });
    }

    if (!['COPY_CODE', 'ONE_TAP', 'ZERO_TAP'].includes(otp_type)) {
      return res.status(400).json({ 
        error: 'Invalid otp_type. Must be COPY_CODE, ONE_TAP, or ZERO_TAP' 
      });
    }

    // Validate ONE_TAP and ZERO_TAP requirements
    if ((otp_type === 'ONE_TAP' || otp_type === 'ZERO_TAP') && (!package_name || !signature_hash)) {
      return res.status(400).json({ 
        error: 'package_name and signature_hash are required for ONE_TAP and ZERO_TAP' 
      });
    }

    const result = await authTemplateService.createTemplate({
      user_id,
      waba_id: user.waba_id,
      access_token: user.access_token,
      name,
      language,
      otp_type,
      add_security_recommendation,
      code_expiration_minutes,
      button_text,
      autofill_text,
      package_name,
      signature_hash,
      message_send_ttl_seconds,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error creating auth template:', error);
    res.status(500).json({ 
      error: 'Failed to create authentication template',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Get all auth templates
 */
export async function getAuthTemplates(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const templates = await authTemplateService.getTemplates(user_id);
    res.json({ templates });
  } catch (error: any) {
    console.error('Error getting auth templates:', error);
    res.status(500).json({ error: 'Failed to get authentication templates' });
  }
}

/**
 * Get single auth template
 */
export async function getAuthTemplate(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const template = await authTemplateService.getTemplate(id, user_id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error: any) {
    console.error('Error getting auth template:', error);
    res.status(500).json({ error: 'Failed to get authentication template' });
  }
}

/**
 * Delete auth template
 */
export async function deleteAuthTemplate(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(user_id);
    if (!user || !user.access_token || !user.waba_id) {
      return res.status(400).json({ error: 'User credentials not found' });
    }

    const { id } = req.params;
    const result = await authTemplateService.deleteTemplate(
      id,
      user_id,
      user.waba_id,
      user.access_token
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error deleting auth template:', error);
    res.status(500).json({ 
      error: 'Failed to delete authentication template',
      details: error.message,
    });
  }
}

/**
 * Send OTP
 */
export async function sendOTP(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(user_id);
    if (!user || !user.access_token || !user.phone_number_id) {
      return res.status(400).json({ error: 'User credentials not found' });
    }

    const {
      to,
      template_name,
      language_code,
      expiry_minutes,
    } = req.body;

    if (!to || !template_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, template_name' 
      });
    }

    const result = await authTemplateService.sendOTP({
      user_id,
      phone_number_id: user.phone_number_id,
      access_token: user.access_token,
      to,
      template_name,
      language_code,
      expiry_minutes,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone_number, code } = req.body;

    if (!phone_number || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: phone_number, code' 
      });
    }

    const result = await authTemplateService.verifyOTP(user_id, phone_number, code);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

/**
 * Get template previews
 */
export async function getTemplatePreviews(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(user_id);
    if (!user || !user.access_token || !user.waba_id) {
      return res.status(400).json({ error: 'User credentials not found' });
    }

    const { languages, add_security_recommendation, code_expiration_minutes } = req.query;

    const languageArray = languages ? (languages as string).split(',') : undefined;
    const addSecurity = add_security_recommendation === 'true';
    const expiryMinutes = code_expiration_minutes ? parseInt(code_expiration_minutes as string) : undefined;

    const previews = await authTemplateService.getTemplatePreviews(
      user.waba_id,
      user.access_token,
      languageArray,
      addSecurity,
      expiryMinutes
    );

    res.json(previews);
  } catch (error: any) {
    console.error('Error getting template previews:', error);
    res.status(500).json({ 
      error: 'Failed to get template previews',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Get OTP history
 */
export async function getOTPHistory(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const history = await authTemplateService.getOTPHistory(user_id, limit);

    res.json({ history });
  } catch (error: any) {
    console.error('Error getting OTP history:', error);
    res.status(500).json({ error: 'Failed to get OTP history' });
  }
}
