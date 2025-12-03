import { Router } from 'express';
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  sendTemplate,
  // Template Groups
  createGroup,
  getGroup,
  listGroups,
  updateGroup,
  deleteGroup,
  // Analytics
  getGroupAnalytics,
  getTemplateAnalytics,
  // Pausing
  checkTemplatePausingStatus,
  getAllTemplatesPausingStatus,
  // Marketing Limits
  getMessagingLimitTier
} from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Template CRUD
router.get('/', getTemplates);
router.post('/', createTemplate);
router.post('/send', sendTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

// Template Groups
router.get('/groups', listGroups);
router.post('/groups', createGroup);
router.get('/groups/:groupId', getGroup);
router.put('/groups/:groupId', updateGroup);
router.delete('/groups/:groupId', deleteGroup);

// Analytics
router.get('/groups/:groupId/analytics', getGroupAnalytics);
router.get('/:templateId/analytics', getTemplateAnalytics);

// Pausing
router.get('/pausing/all', getAllTemplatesPausingStatus);
router.get('/:templateId/pausing', checkTemplatePausingStatus);

// Marketing Limits & Tier
router.get('/tier/status', getMessagingLimitTier as any);

export default router;
