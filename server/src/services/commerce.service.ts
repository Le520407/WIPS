import axios from 'axios';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Get commerce settings for a phone number
 */
export async function getCommerceSettings(phoneNumberId: string) {
  const response = await axios.get(
    `${GRAPH_API_URL}/${phoneNumberId}/whatsapp_commerce_settings`,
    {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    }
  );
  return response.data;
}

/**
 * Update commerce settings (cart and catalog visibility)
 */
export async function updateCommerceSettings(
  phoneNumberId: string,
  settings: {
    is_cart_enabled?: boolean;
    is_catalog_visible?: boolean;
  }
) {
  const params = new URLSearchParams();
  if (settings.is_cart_enabled !== undefined) {
    params.append('is_cart_enabled', settings.is_cart_enabled.toString());
  }
  if (settings.is_catalog_visible !== undefined) {
    params.append('is_catalog_visible', settings.is_catalog_visible.toString());
  }

  const response = await axios.post(
    `${GRAPH_API_URL}/${phoneNumberId}/whatsapp_commerce_settings?${params.toString()}`,
    {},
    {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    }
  );
  return response.data;
}

/**
 * Send single product message
 */
export async function sendSingleProductMessage(
  phoneNumberId: string,
  to: string,
  catalogId: string,
  productRetailerId: string,
  bodyText: string,
  footerText?: string
) {
  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'product',
      body: { text: bodyText },
      action: {
        catalog_id: catalogId,
        product_retailer_id: productRetailerId,
      },
    },
  };

  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  const response = await axios.post(
    `${GRAPH_API_URL}/${phoneNumberId}/messages`,
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
 * Send multi-product message
 */
export async function sendMultiProductMessage(
  phoneNumberId: string,
  to: string,
  catalogId: string,
  headerText: string,
  bodyText: string,
  sections: Array<{
    title: string;
    product_items: Array<{ product_retailer_id: string }>;
  }>,
  footerText?: string
) {
  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'product_list',
      header: {
        type: 'text',
        text: headerText,
      },
      body: { text: bodyText },
      action: {
        catalog_id: catalogId,
        sections,
      },
    },
  };

  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  const response = await axios.post(
    `${GRAPH_API_URL}/${phoneNumberId}/messages`,
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
 * Send catalog message
 */
export async function sendCatalogMessage(
  phoneNumberId: string,
  to: string,
  bodyText: string,
  thumbnailProductRetailerId?: string,
  footerText?: string
) {
  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'catalog_message',
      body: { text: bodyText },
      action: {
        name: 'catalog_message',
      },
    },
  };

  if (thumbnailProductRetailerId) {
    payload.interactive.action.parameters = {
      thumbnail_product_retailer_id: thumbnailProductRetailerId,
    };
  }

  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  const response = await axios.post(
    `${GRAPH_API_URL}/${phoneNumberId}/messages`,
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
 * Get catalog info
 */
export async function getCatalogInfo(catalogId: string) {
  const response = await axios.get(`${GRAPH_API_URL}/${catalogId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
      fields: 'id,name,product_count',
    },
  });
  return response.data;
}

/**
 * Get products from catalog
 */
export async function getCatalogProducts(catalogId: string, limit = 50) {
  const response = await axios.get(`${GRAPH_API_URL}/${catalogId}/products`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
      fields:
        'id,retailer_id,name,description,price,currency,image_url,availability,url',
      limit,
    },
  });
  return response.data;
}

/**
 * Create product in catalog
 */
export async function createProduct(
  catalogId: string,
  productData: {
    retailer_id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    image_url?: string;
    availability: 'in stock' | 'out of stock';
    url?: string;
  }
) {
  const response = await axios.post(
    `${GRAPH_API_URL}/${catalogId}/products`,
    productData,
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
 * Update product in catalog
 */
export async function updateProduct(productId: string, productData: any) {
  const response = await axios.post(
    `${GRAPH_API_URL}/${productId}`,
    productData,
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
 * Delete product from catalog
 */
export async function deleteProduct(productId: string) {
  const response = await axios.delete(`${GRAPH_API_URL}/${productId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  return response.data;
}
