import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createWhatsAppTemplate, getWhatsAppTemplates, deleteWhatsAppTemplate } from '../services/whatsapp.service';
import * as whatsappService from '../services/whatsapp.service';
import Template from '../models/Template';

export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    // Get templates from database
    const templates = await Template.findAll({
      where: { user_id: req.user!.id },
      order: [['createdAt', 'DESC']],
    });

    // Optionally sync with WhatsApp API to get latest status
    const syncParam = req.query.sync;
    if (syncParam === 'true') {
      console.log('🔄 Syncing template statuses from WhatsApp API...');
      try {
        const whatsappTemplates = await getWhatsAppTemplates();
        
        // Update status for each template
        for (const template of templates) {
          const whatsappTemplate = whatsappTemplates.find((wt: any) => wt.name === template.name);
          if (whatsappTemplate && whatsappTemplate.status !== template.status) {
            console.log(`📝 Updating ${template.name}: ${template.status} → ${whatsappTemplate.status}`);
            await template.update({ status: whatsappTemplate.status });
          }
        }
        
        console.log('✅ Template statuses synced successfully');
      } catch (syncError) {
        console.error('⚠️ Failed to sync with WhatsApp API:', syncError);
        // Continue anyway with database data
      }
    }
    
    // Refresh templates from database after sync
    const updatedTemplates = await Template.findAll({
      where: { user_id: req.user!.id },
      order: [['createdAt', 'DESC']],
    });
    
    res.json({ templates: updatedTemplates.map(t => t.toJSON()) });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 Received template creation request:', JSON.stringify(req.body, null, 2));
    
    const { name, language, category, components } = req.body;
    
    if (!name || !language || !category || !components) {
      console.log('❌ Missing required fields:', { name, language, category, components: !!components });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate body component
    const bodyComponent = components.find((c: any) => c.type === 'BODY');
    if (bodyComponent) {
      const text = bodyComponent.text || '';
      // Remove all parameter placeholders to check if there's actual text
      const textWithoutParams = text.replace(/\{\{\d+\}\}/g, '').trim();
      
      if (!textWithoutParams) {
        return res.status(400).json({ 
          error: 'Template body must contain actual text, not just parameters. Example: "Hello {{1}}, welcome to our service!"' 
        });
      }
      
      // Check for more than 2 consecutive newlines
      if (/\n\n\n/.test(text)) {
        return res.status(400).json({ 
          error: 'Template body cannot have more than two consecutive newline characters' 
        });
      }
    }

    const result = await createWhatsAppTemplate({ name, language, category, components });
    
    // Save template to database
    const template = await Template.create({
      user_id: req.user!.id,
      name,
      language,
      category,
      components,
      status: 'PENDING',
      template_id: result.id,
    });
    
    res.json({ success: true, template: template.toJSON() });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, language, category, components } = req.body;
    
    const template = await Template.findByPk(id);
    
    if (!template || template.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await template.update({ name, language, category, components });
    
    res.json({ success: true, template: template.toJSON() });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await Template.findByPk(id);
    
    if (!template || template.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Template not found' });
    }

    console.log(`🗑️ Deleting template: ${template.name} (Status: ${template.status})`);
    
    let whatsappDeleted = false;
    let whatsappError = null;

    // Delete from WhatsApp first (if it exists there)
    try {
      await deleteWhatsAppTemplate(template.name);
      console.log('✅ Template deleted from WhatsApp/Meta');
      whatsappDeleted = true;
    } catch (whatsappError: any) {
      // If template doesn't exist on WhatsApp (404), that's okay
      if (whatsappError.response?.status === 404) {
        console.log('ℹ️ Template not found on WhatsApp (already deleted or never existed)');
        whatsappDeleted = true; // Consider it deleted
      } else {
        console.error('⚠️ Failed to delete from WhatsApp:', whatsappError.response?.data || whatsappError.message);
        whatsappError = whatsappError.response?.data?.error?.message || whatsappError.message;
        // Continue anyway - we'll still delete from database
      }
    }

    // Delete from database
    await template.destroy();
    console.log('✅ Template deleted from database');
    
    res.json({ 
      success: true, 
      message: 'Template deleted successfully',
      details: {
        templateName: template.name,
        deletedFromWhatsApp: whatsappDeleted,
        deletedFromDatabase: true,
        whatsappError: whatsappError
      }
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

export const sendTemplate = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📤 Received template send request:', JSON.stringify(req.body, null, 2));
    
    const { to, templateName, languageCode, components } = req.body;
    
    if (!to || !templateName || !languageCode) {
      console.log('❌ Missing required fields:', { to, templateName, languageCode });
      return res.status(400).json({ error: 'Missing required fields: to, templateName, languageCode' });
    }

    // Send template via WhatsApp service
    const { sendTemplateMessage } = require('../services/whatsapp.service');
    const result = await sendTemplateMessage(to, templateName, languageCode, components);
    
    console.log('✅ Template sent successfully:', result);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Send template error:', error);
    console.error('Error details:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to send template',
      details: error.response?.data || error.message 
    });
  }
};


// ==================== Template Groups ====================

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, templateIds } = req.body;
    
    if (!name || !templateIds || !Array.isArray(templateIds)) {
      return res.status(400).json({ error: 'Missing required fields: name, templateIds' });
    }

    const { createTemplateGroup } = require('../services/whatsapp.service');
    const result = await createTemplateGroup(name, description || '', templateIds);
    
    res.json({ success: true, group: result });
  } catch (error: any) {
    console.error('Create group error:', error);
    res.status(500).json({ 
      error: 'Failed to create template group',
      details: error.response?.data || error.message 
    });
  }
};

export const getGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    
    const { getTemplateGroup } = require('../services/whatsapp.service');
    const result = await getTemplateGroup(groupId);
    
    res.json({ success: true, group: result });
  } catch (error: any) {
    console.error('Get group error:', error);
    res.status(500).json({ 
      error: 'Failed to get template group',
      details: error.response?.data || error.message 
    });
  }
};

export const listGroups = async (req: AuthRequest, res: Response) => {
  try {
    const { listTemplateGroups } = require('../services/whatsapp.service');
    const groups = await listTemplateGroups();
    
    res.json({ success: true, groups });
  } catch (error: any) {
    console.error('List groups error:', error);
    res.status(500).json({ 
      error: 'Failed to list template groups',
      details: error.response?.data || error.message 
    });
  }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { name, description, add_templates, remove_templates } = req.body;
    
    const updates: any = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (add_templates) updates.add_templates = add_templates;
    if (remove_templates) updates.remove_templates = remove_templates;
    
    const { updateTemplateGroup } = require('../services/whatsapp.service');
    const result = await updateTemplateGroup(groupId, updates);
    
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Update group error:', error);
    res.status(500).json({ 
      error: 'Failed to update template group',
      details: error.response?.data || error.message 
    });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    
    const { deleteTemplateGroup } = require('../services/whatsapp.service');
    const result = await deleteTemplateGroup(groupId);
    
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Delete group error:', error);
    res.status(500).json({ 
      error: 'Failed to delete template group',
      details: error.response?.data || error.message 
    });
  }
};


// ==================== Template Group Analytics ====================

export const getGroupAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;
    
    const { getTemplateGroupAnalytics } = require('../services/whatsapp.service');
    const analytics = await getTemplateGroupAnalytics(
      groupId, 
      startDate as string, 
      endDate as string
    );
    
    res.json({ success: true, analytics });
  } catch (error: any) {
    console.error('Get group analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get template group analytics',
      details: error.response?.data || error.message 
    });
  }
};

export const getTemplateAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const { startDate, endDate } = req.query;
    
    const { getTemplateAnalytics: getAnalytics } = require('../services/whatsapp.service');
    const analytics = await getAnalytics(
      templateId, 
      startDate as string, 
      endDate as string
    );
    
    res.json({ success: true, analytics });
  } catch (error: any) {
    console.error('Get template analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get template analytics',
      details: error.response?.data || error.message 
    });
  }
};


// ==================== Template Pausing Detection ====================

export const checkTemplatePausingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    
    const { checkTemplatePausingStatus } = require('../services/whatsapp.service');
    const status = await checkTemplatePausingStatus(templateId);
    
    res.json({ success: true, status });
  } catch (error: any) {
    console.error('Check template pausing error:', error);
    res.status(500).json({ 
      error: 'Failed to check template pausing status',
      details: error.response?.data || error.message 
    });
  }
};

export const getAllTemplatesPausingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { getAllTemplatesPausingStatus } = require('../services/whatsapp.service');
    const status = await getAllTemplatesPausingStatus();
    
    res.json({ success: true, ...status });
  } catch (error: any) {
    console.error('Check all templates pausing error:', error);
    res.status(500).json({ 
      error: 'Failed to check templates pausing status',
      details: error.response?.data || error.message 
    });
  }
};

// Marketing Limits and Tier Status
export const getMessagingLimitTier = async (req: Request, res: Response) => {
  try {
    const tierInfo = await whatsappService.getMessagingLimitTier();
    const upgradePath = whatsappService.getTierUpgradePath(tierInfo.tier);
    const qualityRecs = whatsappService.getQualityRecommendations(tierInfo.quality_rating);
    
    res.json({
      success: true,
      data: {
        ...tierInfo,
        upgrade_path: upgradePath,
        quality_recommendations: qualityRecs
      }
    });
  } catch (error: any) {
    console.error('Error fetching tier status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tier status'
    });
  }
};
