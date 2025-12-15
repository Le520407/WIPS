import axios from 'axios';
import AuthTemplate from '../models/AuthTemplate';
import crypto from 'crypto';
import OTPCode from '../models/OTPCode';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

interface CreateAuthTemplateParams {
  user_id: string;
  waba_id: string;
  access_token: string;
  name: string;
  language: string;
  otp_type: 'COPY_CODE' | 'ONE_TAP' | 'ZERO_TAP';
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number;
  button_text?: string;
  autofill_text?: string;
  package_name?: string;
  signature_hash?: string;
  message_send_ttl_seconds?: number;
}

interface SendOTPParams {
  user_id: string;
  phone_number_id: string;
  access_token: string;
  to: string;
  template_name: string;
  language_code?: string;
  expiry_minutes?: number;
}

export class AuthTemplateService {
  /**
   * Create authentication template on Meta
   */
  async createTemplate(params: CreateAuthTemplateParams) {
    const {
      user_id,
      waba_id,
      access_token,
      name,
      language,
      otp_type,
      add_security_recommendation = true,
      code_expiration_minutes,
      button_text,
      autofill_text,
      package_name,
      signature_hash,
      message_send_ttl_seconds,
    } = params;

    // Build components
    const components: any[] = [
      {
        type: 'body',
        add_security_recommendation,
      },
    ];

    // Add footer if expiration is specified
    if (code_expiration_minutes) {
      components.push({
        type: 'footer',
        code_expiration_minutes,
      });
    }

    // Build button component
    const buttonComponent: any = {
      type: 'buttons',
      buttons: [
        {
          type: 'otp',
          otp_type: otp_type.toLowerCase(),
        },
      ],
    };

    // Add button text for copy code
    if (button_text && otp_type === 'COPY_CODE') {
      buttonComponent.buttons[0].text = button_text;
    }

    // Add autofill text for one-tap
    if (autofill_text && otp_type === 'ONE_TAP') {
      buttonComponent.buttons[0].autofill_text = autofill_text;
      buttonComponent.buttons[0].text = button_text;
    }

    // Add app details for one-tap and zero-tap
    if ((otp_type === 'ONE_TAP' || otp_type === 'ZERO_TAP') && package_name && signature_hash) {
      buttonComponent.buttons[0].supported_apps = [
        {
          package_name,
          signature_hash,
        },
      ];

      if (otp_type === 'ZERO_TAP') {
        buttonComponent.buttons[0].zero_tap_terms_accepted = true;
        buttonComponent.buttons[0].autofill_text = autofill_text;
        buttonComponent.buttons[0].text = button_text;
      }
    }

    components.push(buttonComponent);

    // Build request payload
    const payload: any = {
      name,
      language,
      category: 'authentication',
      components,
    };

    if (message_send_ttl_seconds) {
      payload.message_send_ttl_seconds = message_send_ttl_seconds;
    }

    console.log('Creating auth template:', JSON.stringify(payload, null, 2));

    // Call Meta API
    const response = await axios.post(
      `${GRAPH_API_URL}/${waba_id}/message_templates`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save to database
    const template = await AuthTemplate.create({
      user_id,
      template_id: response.data.id,
      name,
      language,
      category: 'AUTHENTICATION',
      status: response.data.status || 'PENDING',
      otp_type,
      add_security_recommendation,
      code_expiration_minutes,
      button_text,
      autofill_text,
      package_name,
      signature_hash,
      message_send_ttl_seconds,
    });

    return {
      template,
      meta_response: response.data,
    };
  }

  /**
   * Get all auth templates for user
   */
  async getTemplates(user_id: string) {
    return await AuthTemplate.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Get single template
   */
  async getTemplate(id: string, user_id: string) {
    return await AuthTemplate.findOne({
      where: { id, user_id },
    });
  }

  /**
   * Delete template from Meta and database
   */
  async deleteTemplate(id: string, user_id: string, waba_id: string, access_token: string) {
    const template = await this.getTemplate(id, user_id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Delete from Meta if template_id exists
    if (template.template_id) {
      try {
        await axios.delete(
          `${GRAPH_API_URL}/${waba_id}/message_templates?name=${template.name}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
      } catch (error: any) {
        console.error('Error deleting from Meta:', error.response?.data || error.message);
        // Continue with local deletion even if Meta deletion fails
      }
    }

    // Delete from database
    await template.destroy();

    return { success: true };
  }

  /**
   * Generate OTP code
   */
  generateOTP(length: number = 6): string {
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    return crypto.randomInt(min, max + 1).toString();
  }

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP(params: SendOTPParams) {
    const {
      user_id,
      phone_number_id,
      access_token,
      to,
      template_name,
      language_code = 'en_US',
      expiry_minutes = 10,
    } = params;

    // Generate OTP
    const otp = this.generateOTP(6);

    // Calculate expiry
    const expires_at = new Date(Date.now() + expiry_minutes * 60 * 1000);

    // Save OTP to database
    await OTPCode.create({
      user_id,
      phone_number: to,
      code: otp,
      template_name,
      expires_at,
    });

    // Send via WhatsApp
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: template_name,
        language: {
          code: language_code,
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
        ],
      },
    };

    console.log('Sending OTP:', { to, template_name, otp });

    const response = await axios.post(
      `${GRAPH_API_URL}/${phone_number_id}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      message_id: response.data.messages[0].id,
      otp, // Return OTP for testing purposes
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(user_id: string, phone_number: string, code: string) {
    // Find the most recent unverified OTP for this phone number
    const otpRecord = await OTPCode.findOne({
      where: {
        user_id,
        phone_number,
        code,
        verified: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      return {
        success: false,
        error: 'Invalid OTP code',
      };
    }

    // Check if expired
    if (new Date() > otpRecord.expires_at) {
      return {
        success: false,
        error: 'OTP code has expired',
      };
    }

    // Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      return {
        success: false,
        error: 'Too many attempts. Please request a new code.',
      };
    }

    // Increment attempts
    otpRecord.attempts += 1;

    // Mark as verified
    otpRecord.verified = true;
    otpRecord.verified_at = new Date();
    await otpRecord.save();

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }

  /**
   * Get template preview from Meta
   */
  async getTemplatePreviews(
    waba_id: string,
    access_token: string,
    languages?: string[],
    add_security_recommendation?: boolean,
    code_expiration_minutes?: number
  ) {
    const params = new URLSearchParams({
      category: 'AUTHENTICATION',
      button_types: 'OTP',
    });

    if (languages && languages.length > 0) {
      params.append('languages', languages.join(','));
    }

    if (add_security_recommendation !== undefined) {
      params.append('add_security_recommendation', add_security_recommendation.toString());
    }

    if (code_expiration_minutes !== undefined) {
      params.append('code_expiration_minutes', code_expiration_minutes.toString());
    }

    const response = await axios.get(
      `${GRAPH_API_URL}/${waba_id}/message_template_previews?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Get OTP history for user
   */
  async getOTPHistory(user_id: string, limit: number = 50) {
    return await OTPCode.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
      limit,
    });
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOTPs() {
    const result = await OTPCode.destroy({
      where: {
        expires_at: {
          [require('sequelize').Op.lt]: new Date(),
        },
        verified: false,
      },
    });

    return { deleted: result };
  }
}

export default new AuthTemplateService();
