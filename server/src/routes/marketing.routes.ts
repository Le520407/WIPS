import express from 'express';
import * as marketingController from '../controllers/marketing.controller';

const router = express.Router();

// Marketing Templates
router.post('/templates', marketingController.createTemplate);
router.get('/templates', marketingController.getTemplates);
router.post('/templates/:templateId/sync-ad-ids', marketingController.syncTemplateAdIds);

// Marketing Campaigns
router.post('/campaigns', marketingController.createCampaign);
router.get('/campaigns', marketingController.getCampaigns);
router.get('/campaigns/with-insights', marketingController.getCampaignsWithInsights);
router.post('/campaigns/:campaignId/send', marketingController.sendCampaign);
router.get('/campaigns/:campaignId/insights', marketingController.getCampaignInsights);

// Benchmarks
router.get('/benchmarks/:adGroupId', marketingController.getBenchmarks);

// Onboarding Status
router.get('/onboarding-status', marketingController.checkOnboardingStatus);

export default router;
