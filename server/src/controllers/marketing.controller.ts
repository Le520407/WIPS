import { Request, Response } from 'express';
import * as marketingService from '../services/marketing.service';
import MarketingTemplate from '../models/MarketingTemplate';
import MarketingCampaign from '../models/MarketingCampaign';
import Contact from '../models/Contact';
import { Op } from 'sequelize';

const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

/**
 * Create marketing template
 */
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const {
      name,
      language,
      headerText,
      headerImageUrl,
      bodyText,
      footerText,
      buttonText,
      buttonUrl,
      ttl,
    } = req.body;

    // Create template via API
    const result = await marketingService.createMarketingTemplate(WABA_ID, {
      name,
      language,
      headerText,
      headerImageUrl,
      bodyText,
      footerText,
      buttonText,
      buttonUrl,
      ttl,
    });

    // Save to database
    const template = await MarketingTemplate.create({
      user_id: userId as string,
      template_id: result.id,
      name,
      language,
      category: 'marketing',
      status: result.status,
      header_type: headerImageUrl ? 'image' : headerText ? 'text' : undefined,
      header_text: headerText,
      header_image_url: headerImageUrl,
      body_text: bodyText,
      footer_text: footerText,
      button_text: buttonText,
      button_url: buttonUrl,
      ttl,
    });

    res.json({
      success: true,
      template,
      meta_response: result,
    });
  } catch (error: any) {
    console.error('Error creating marketing template:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Get all marketing templates
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;

    const templates = await MarketingTemplate.findAll({
      where: { user_id: userId as string },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error('Error getting marketing templates:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Sync template Ad IDs from Meta
 */
export const syncTemplateAdIds = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    const template = await MarketingTemplate.findOne({
      where: { template_id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    // Get Ad IDs from Meta
    const adData = await marketingService.getTemplateAdIds(WABA_ID, templateId);

    // Update template with Ad IDs
    await template.update({
      ad_id: adData.ad_id,
      ad_adset_id: adData.ad_adset_id,
      ad_campaign_id: adData.ad_campaign_id,
      ad_account_id: adData.ad_account_id,
    });

    res.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error('Error syncing template Ad IDs:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Create marketing campaign
 */
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { name, templateId, targetAudience, scheduledAt } = req.body;

    const template = await MarketingTemplate.findOne({
      where: { template_id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    const campaign = await MarketingCampaign.create({
      user_id: userId as string,
      name,
      template_id: templateId,
      template_name: template.name,
      status: scheduledAt ? 'scheduled' : 'draft',
      target_audience: targetAudience,
      scheduled_at: scheduledAt,
      ad_id: template.ad_id,
      ad_campaign_id: template.ad_campaign_id,
    });

    res.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all campaigns
 */
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;

    const campaigns = await MarketingCampaign.findAll({
      where: { user_id: userId as string },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      campaigns,
    });
  } catch (error: any) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send campaign
 */
export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.id || req.query.userId;

    const campaign = await MarketingCampaign.findOne({
      where: { id: campaignId, user_id: userId as string },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const template = await MarketingTemplate.findOne({
      where: { template_id: campaign.template_id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    // Get target contacts
    const targetAudience = campaign.target_audience;
    let contacts: Contact[] = [];

    if (targetAudience.contacts && targetAudience.contacts.length > 0) {
      contacts = await Contact.findAll({
        where: {
          id: { [Op.in]: targetAudience.contacts },
          user_id: userId as string,
        },
      });
    } else if (targetAudience.labels && targetAudience.labels.length > 0) {
      contacts = await Contact.findAll({
        where: {
          user_id: userId as string,
        },
      });
      // Filter by labels (assuming labels are stored in contact)
      contacts = contacts.filter((contact: any) =>
        targetAudience.labels.some((label: string) =>
          contact.labels?.includes(label)
        )
      );
    }

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No contacts found for target audience',
      });
    }

    // Update campaign status
    await campaign.update({ status: 'sending' });

    // Send messages
    const results = [];
    let sentCount = 0;

    for (const contact of contacts) {
      try {
        const result = await marketingService.sendMarketingMessage(
          PHONE_NUMBER_ID,
          contact.phone_number,
          template.name,
          template.language,
          undefined,
          {
            productPolicy: 'CLOUD_API_FALLBACK',
            messageActivitySharing: true,
          }
        );

        results.push({
          contact: contact.phone_number,
          success: true,
          messageId: result.messages[0].id,
        });
        sentCount++;
      } catch (error: any) {
        results.push({
          contact: contact.phone_number,
          success: false,
          error: error.response?.data || error.message,
        });
      }
    }

    // Update campaign stats
    await campaign.update({
      status: 'completed',
      sent_count: sentCount,
    });

    res.json({
      success: true,
      campaign,
      results,
      summary: {
        total: contacts.length,
        sent: sentCount,
        failed: contacts.length - sentCount,
      },
    });
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get campaign insights
 */
export const getCampaignInsights = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.id || req.query.userId;

    const campaign = await MarketingCampaign.findOne({
      where: { id: campaignId, user_id: userId as string },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    if (!campaign.ad_id) {
      return res.status(400).json({
        success: false,
        error: 'Campaign does not have Ad ID. Please sync template first.',
      });
    }

    // Get insights from Meta
    const insights = await marketingService.getMarketingInsights(
      campaign.ad_id
    );

    res.json({
      success: true,
      campaign,
      insights: insights.data[0] || {},
    });
  } catch (error: any) {
    console.error('Error getting campaign insights:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Get benchmark metrics
 */
export const getBenchmarks = async (req: Request, res: Response) => {
  try {
    const { adGroupId } = req.params;

    const benchmarks = await marketingService.getBenchmarkMetrics(adGroupId);

    res.json({
      success: true,
      benchmarks: benchmarks.data[0] || {},
    });
  } catch (error: any) {
    console.error('Error getting benchmarks:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Get all campaigns with insights
 */
export const getCampaignsWithInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;

    const campaigns = await MarketingCampaign.findAll({
      where: { user_id: userId as string },
      order: [['created_at', 'DESC']],
    });

    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign) => {
        if (!campaign.ad_id) {
          return {
            ...campaign.toJSON(),
            insights: null,
          };
        }

        try {
          const insights = await marketingService.getMarketingInsights(
            campaign.ad_id
          );
          return {
            ...campaign.toJSON(),
            insights: insights.data[0] || null,
          };
        } catch (error) {
          return {
            ...campaign.toJSON(),
            insights: null,
          };
        }
      })
    );

    res.json({
      success: true,
      campaigns: campaignsWithInsights,
    });
  } catch (error: any) {
    console.error('Error getting campaigns with insights:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


/**
 * Check Marketing Messages API onboarding status
 */
export const checkOnboardingStatus = async (req: Request, res: Response) => {
  try {
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!wabaId) {
      return res.status(500).json({
        error: 'WABA ID not configured',
      });
    }

    // Check onboarding status from Meta API
    const response = await marketingService.checkOnboardingStatus(wabaId);

    res.json({
      status: response.marketing_messages_onboarding_status || 'NOT_ELIGIBLE',
      waba_id: wabaId,
      raw_response: response,
    });
  } catch (error: any) {
    console.error('Error checking onboarding status:', error);
    res.status(500).json({
      error: 'Failed to check onboarding status',
      details: error.response?.data || error.message,
    });
  }
};
