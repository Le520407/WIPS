import express from 'express';
import * as websiteController from '../controllers/website.controller';

const router = express.Router();

// Website routes
router.get('/websites', websiteController.getWebsites);
router.get('/websites/:id', websiteController.getWebsite);
router.post('/websites', websiteController.createWebsite);
router.put('/websites/:id', websiteController.updateWebsite);
router.delete('/websites/:id', websiteController.deleteWebsite);

// API Key routes
router.get('/websites/:websiteId/keys', websiteController.getApiKeys);
router.post('/websites/:websiteId/keys', websiteController.generateKey);
router.delete('/keys/:keyId', websiteController.revokeKey);

// Usage statistics
router.get('/websites/:websiteId/stats', websiteController.getUsageStats);

export default router;
