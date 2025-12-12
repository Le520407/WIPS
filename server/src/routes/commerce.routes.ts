import express from 'express';
import {
  getCommerceSettings,
  updateCommerceSettingsController,
  sendSingleProduct,
  sendMultiProduct,
  sendCatalog,
  getCatalog,
  getProducts,
  createProductController,
  updateProductController,
  deleteProductController,
  getLocalProducts,
} from '../controllers/commerce.controller';

const router = express.Router();

// Commerce settings
router.get('/settings', getCommerceSettings);
router.put('/settings', updateCommerceSettingsController);

// Send product messages
router.post('/messages/single-product', sendSingleProduct);
router.post('/messages/multi-product', sendMultiProduct);
router.post('/messages/catalog', sendCatalog);

// Catalog management
router.get('/catalogs/:catalogId', getCatalog);
router.get('/catalogs/:catalogId/products', getProducts);
router.get('/catalogs/:catalogId/products/local', getLocalProducts);

// Product management
router.post('/catalogs/:catalogId/products', createProductController);
router.put('/products/:productId', updateProductController);
router.delete('/products/:productId', deleteProductController);

export default router;
