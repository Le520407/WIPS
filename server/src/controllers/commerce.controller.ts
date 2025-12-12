import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getCommerceSettings as getSettings,
  updateCommerceSettings as updateSettings,
  sendSingleProductMessage,
  sendMultiProductMessage,
  sendCatalogMessage,
  getCatalogInfo,
  getCatalogProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/commerce.service';
import { CommerceSettings, ProductCatalog, Product } from '../models';

// Get commerce settings
export const getCommerceSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumberId, userId } = req.query;
    const user_id = userId || req.user?.id;

    if (!user_id || !phoneNumberId) {
      return res
        .status(400)
        .json({ error: 'User ID and Phone Number ID required' });
    }

    // Get from Meta API
    const metaSettings = await getSettings(phoneNumberId as string);

    // Save/update in database
    const [settings] = await CommerceSettings.findOrCreate({
      where: { phone_number_id: phoneNumberId as string },
      defaults: {
        user_id: user_id as string,
        phone_number_id: phoneNumberId as string,
        is_cart_enabled:
          metaSettings.data[0]?.is_cart_enabled !== undefined
            ? metaSettings.data[0].is_cart_enabled
            : true,
        is_catalog_visible:
          metaSettings.data[0]?.is_catalog_visible !== undefined
            ? metaSettings.data[0].is_catalog_visible
            : false,
      },
    });

    res.json({ success: true, settings: metaSettings.data[0], local: settings });
  } catch (error: any) {
    console.error('Get commerce settings error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to get commerce settings',
    });
  }
};

// Update commerce settings
export const updateCommerceSettingsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { phoneNumberId, is_cart_enabled, is_catalog_visible, userId } =
      req.body;
    const user_id = userId || req.user?.id;

    if (!user_id || !phoneNumberId) {
      return res
        .status(400)
        .json({ error: 'User ID and Phone Number ID required' });
    }

    const settingsToUpdate: any = {};
    if (is_cart_enabled !== undefined)
      settingsToUpdate.is_cart_enabled = is_cart_enabled;
    if (is_catalog_visible !== undefined)
      settingsToUpdate.is_catalog_visible = is_catalog_visible;

    // Update in Meta API
    const result = await updateSettings(phoneNumberId, settingsToUpdate);

    // Update in database
    await CommerceSettings.upsert({
      user_id: user_id as string,
      phone_number_id: phoneNumberId,
      ...settingsToUpdate,
    });

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Update commerce settings error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update commerce settings',
    });
  }
};

// Send single product message
export const sendSingleProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      phoneNumberId,
      to,
      catalogId,
      productRetailerId,
      bodyText,
      footerText,
    } = req.body;

    if (!phoneNumberId || !to || !catalogId || !productRetailerId || !bodyText) {
      return res.status(400).json({
        error:
          'Phone Number ID, recipient, catalog ID, product ID, and body text required',
      });
    }

    const result = await sendSingleProductMessage(
      phoneNumberId,
      to,
      catalogId,
      productRetailerId,
      bodyText,
      footerText
    );

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Send single product error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to send single product message',
    });
  }
};

// Send multi-product message
export const sendMultiProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      phoneNumberId,
      to,
      catalogId,
      headerText,
      bodyText,
      sections,
      footerText,
    } = req.body;

    if (
      !phoneNumberId ||
      !to ||
      !catalogId ||
      !headerText ||
      !bodyText ||
      !sections
    ) {
      return res.status(400).json({
        error:
          'Phone Number ID, recipient, catalog ID, header, body, and sections required',
      });
    }

    const result = await sendMultiProductMessage(
      phoneNumberId,
      to,
      catalogId,
      headerText,
      bodyText,
      sections,
      footerText
    );

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Send multi-product error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to send multi-product message',
    });
  }
};

// Send catalog message
export const sendCatalog = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumberId, to, bodyText, thumbnailProductRetailerId, footerText } =
      req.body;

    if (!phoneNumberId || !to || !bodyText) {
      return res.status(400).json({
        error: 'Phone Number ID, recipient, and body text required',
      });
    }

    const result = await sendCatalogMessage(
      phoneNumberId,
      to,
      bodyText,
      thumbnailProductRetailerId,
      footerText
    );

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Send catalog error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to send catalog message',
    });
  }
};

// Get catalog info
export const getCatalog = async (req: AuthRequest, res: Response) => {
  try {
    const { catalogId } = req.params;

    if (!catalogId) {
      return res.status(400).json({ error: 'Catalog ID required' });
    }

    const catalog = await getCatalogInfo(catalogId);
    res.json({ success: true, catalog });
  } catch (error: any) {
    console.error('Get catalog error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to get catalog',
    });
  }
};

// Get products from catalog
export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { catalogId } = req.params;
    const { limit } = req.query;

    if (!catalogId) {
      return res.status(400).json({ error: 'Catalog ID required' });
    }

    const products = await getCatalogProducts(
      catalogId,
      limit ? parseInt(limit as string) : 50
    );
    res.json({ success: true, products: products.data });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to get products',
    });
  }
};

// Create product
export const createProductController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { catalogId } = req.params;
    const productData = req.body;

    if (!catalogId) {
      return res.status(400).json({ error: 'Catalog ID required' });
    }

    if (!productData.retailer_id || !productData.name || !productData.price) {
      return res
        .status(400)
        .json({ error: 'Retailer ID, name, and price required' });
    }

    const result = await createProduct(catalogId, productData);

    // Save to local database
    await Product.create({
      catalog_id: catalogId,
      product_retailer_id: productData.retailer_id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      currency: productData.currency || 'USD',
      image_url: productData.image_url,
      availability: productData.availability || 'in stock',
      url: productData.url,
    });

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create product',
    });
  }
};

// Update product
export const updateProductController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const productData = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const result = await updateProduct(productId, productData);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update product',
    });
  }
};

// Delete product
export const deleteProductController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const result = await deleteProduct(productId);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to delete product',
    });
  }
};

// Get local products
export const getLocalProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { catalogId } = req.params;

    const products = await Product.findAll({
      where: { catalog_id: catalogId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, products });
  } catch (error: any) {
    console.error('Get local products error:', error);
    res.status(500).json({ error: 'Failed to get local products' });
  }
};
