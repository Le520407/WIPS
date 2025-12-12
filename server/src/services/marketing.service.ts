import axios from 'axios';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;

/**
 * Marketing Messages API Service
 * Handles marketing campaigns, template creation, and conversion tracking
 */

/**
 * Create marketing template with product image and CTA
 */
export async function createMarketingTemplate(
  wabaId: string,
  templateData: {
    name: string;
    language: string;
    headerText?: string;
    headerImageUrl?: string;
    bodyText: string;
    footerText?: string;
    buttonText?: string;
    buttonUrl?: string;
    ttl?: number; // Time-to-live in seconds (12 hours to 30 days)
  }
) {
  const components: any[] = [];

  // Header component
  if (templateData.headerImageUrl) {
    components.push({
      type: 'header',
      format: 'image',
      example: {
        header_handle: [templateData.headerImageUrl],
      },
    });
  } else if (templateData.headerText) {
    components.push({
      type: 'header',
      format: 'text',
      text: templateData.headerText,
    });
  }

  // Body component
  components.push({
    type: 'body',
    text: templateData.bodyText,
  });

  // Footer component
  if (templateData.footerText) {
    components.push({
      type: 'footer',
      text: templateData.footerText,
    });
  }

  // Button component
  if (templateData.buttonText && templateData.buttonUrl) {
    components.push({
      type: 'buttons',
      buttons: [
        {
          type: 'url',
          text: templateData.buttonText,
          url: templateData.buttonUrl,
        },
      ],
    });
  }

  const payload: any = {
    name: templateData.name,
    language: templateData.language,
    category: 'marketing',
    components,
  };

  // Add TTL if specified
  if (templateData.ttl) {
    payload.message_send_ttl_seconds = templateData.ttl;
  }

  const response = await axios.post(
    `${GRAPH_API_URL}/${wabaId}/message_templates`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  return response.data;
}

/**
 * Send marketing message via Marketing Messages API
 */
export async function sendMarketingMessage(
  phoneNumberId: string,
  to: string,
  templateName: string,
  languageCode: string,
  components?: any[],
  options?: {
    productPolicy?: 'CLOUD_API_FALLBACK' | 'STRICT';
    messageActivitySharing?: boolean;
  }
) {
  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  if (components && components.length > 0) {
    payload.template.components = components;
  }

  // Add optional parameters
  if (options?.productPolicy) {
    payload.product_policy = options.productPolicy;
  }
  if (options?.messageActivitySharing !== undefined) {
    payload.message_activity_sharing = options.messageActivitySharing;
  }

  const response = await axios.post(
    `${GRAPH_API_URL}/${phoneNumberId}/marketing_messages`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  return response.data;
}

/**
 * Get template Ad IDs for Insights API
 */
export async function getTemplateAdIds(wabaId: string, templateId?: string) {
  const url = templateId
    ? `${GRAPH_API_URL}/${templateId}`
    : `${GRAPH_API_URL}/${wabaId}/message_templates`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
      fields: 'id,name,category,ad_id,ad_adset_id,ad_campaign_id,ad_account_id',
    },
  });

  return response.data;
}

/**
 * Get marketing metrics via Insights API
 */
export async function getMarketingInsights(
  adId: string,
  fields: string[] = [
    'marketing_messages_sent',
    'marketing_messages_delivered',
    'marketing_messages_read',
    'marketing_messages_link_btn_click',
    'marketing_messages_delivery_rate',
    'marketing_messages_read_rate',
    'marketing_messages_link_btn_click_rate',
    'marketing_messages_spend',
    'marketing_messages_cost_per_delivered',
    'marketing_messages_cost_per_link_btn_click',
    'marketing_messages_website_purchase',
    'marketing_messages_website_purchase_values',
  ],
  dateRange?: {
    since?: string; // YYYY-MM-DD
    until?: string; // YYYY-MM-DD
  }
) {
  const params: any = {
    fields: fields.join(','),
  };

  if (dateRange?.since) {
    params.time_range = JSON.stringify({
      since: dateRange.since,
      until: dateRange.until || new Date().toISOString().split('T')[0],
    });
  }

  const response = await axios.get(`${GRAPH_API_URL}/${adId}/insights`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params,
  });

  return response.data;
}

/**
 * Get benchmark metrics
 */
export async function getBenchmarkMetrics(adGroupId: string) {
  const response = await axios.get(`${GRAPH_API_URL}/${adGroupId}/insights`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
      fields:
        'marketing_messages_read,marketing_messages_read_rate,marketing_messages_read_rate_benchmark,marketing_messages_link_btn_click,marketing_messages_link_btn_click_rate,marketing_messages_click_rate_benchmark',
    },
  });

  return response.data;
}

/**
 * Configure automatic creative optimizations at template level
 */
export async function configureCreativeOptimizations(
  wabaId: string,
  templateName: string,
  optimizations: {
    imageBrightnessAndContrast?: 'OPT_IN' | 'OPT_OUT';
    imageTouchups?: 'OPT_IN' | 'OPT_OUT';
    addTextOverlay?: 'OPT_IN' | 'OPT_OUT';
    imageAnimation?: 'OPT_IN' | 'OPT_OUT';
    imageBackgroundGen?: 'OPT_IN' | 'OPT_OUT';
    textExtractionForHeadline?: 'OPT_IN' | 'OPT_OUT';
    textExtractionForTapTarget?: 'OPT_IN' | 'OPT_OUT';
    productExtensions?: 'OPT_IN' | 'OPT_OUT';
    textFormattingOptimization?: 'OPT_IN' | 'OPT_OUT';
  }
) {
  const creativeFeatures: any = {};

  if (optimizations.imageBrightnessAndContrast) {
    creativeFeatures.image_brightness_and_contrast = {
      enroll_status: optimizations.imageBrightnessAndContrast,
    };
  }
  if (optimizations.imageTouchups) {
    creativeFeatures.image_touchups = {
      enroll_status: optimizations.imageTouchups,
    };
  }
  if (optimizations.addTextOverlay) {
    creativeFeatures.add_text_overlay = {
      enroll_status: optimizations.addTextOverlay,
    };
  }
  if (optimizations.imageAnimation) {
    creativeFeatures.image_animation = {
      enroll_status: optimizations.imageAnimation,
    };
  }
  if (optimizations.imageBackgroundGen) {
    creativeFeatures.image_background_gen = {
      enroll_status: optimizations.imageBackgroundGen,
    };
  }
  if (optimizations.textExtractionForHeadline) {
    creativeFeatures.text_extraction_for_headline = {
      enroll_status: optimizations.textExtractionForHeadline,
    };
  }
  if (optimizations.textExtractionForTapTarget) {
    creativeFeatures.text_extraction_for_tap_target = {
      enroll_status: optimizations.textExtractionForTapTarget,
    };
  }
  if (optimizations.productExtensions) {
    creativeFeatures.product_extensions = {
      enroll_status: optimizations.productExtensions,
    };
  }
  if (optimizations.textFormattingOptimization) {
    creativeFeatures.text_formatting_optimization = {
      enroll_status: optimizations.textFormattingOptimization,
    };
  }

  const payload = {
    name: templateName,
    degrees_of_freedom_spec: {
      creative_features_spec: creativeFeatures,
    },
  };

  const response = await axios.post(
    `${GRAPH_API_URL}/${wabaId}/message_templates`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  return response.data;
}

/**
 * Get template analytics via WhatsApp Business Management API
 */
export async function getTemplateAnalytics(
  wabaId: string,
  startTimestamp: number,
  endTimestamp: number
) {
  const response = await axios.get(`${GRAPH_API_URL}/${wabaId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
      fields: `conversation_analytics.start(${startTimestamp}).end(${endTimestamp}).granularity(DAILY).conversation_categories(MARKETING_LITE).dimensions(["CONVERSATION_CATEGORY"])`,
    },
  });

  return response.data;
}


/**
 * Check Marketing Messages API onboarding status
 */
export async function checkOnboardingStatus(wabaId: string): Promise<any> {
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}/${wabaId}`,
      {
        params: {
          fields: 'marketing_messages_onboarding_status',
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error checking onboarding status:', error.response?.data || error.message);
    throw error;
  }
}
