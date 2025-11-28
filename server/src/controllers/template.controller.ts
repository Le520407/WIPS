import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createWhatsAppTemplate, getWhatsAppTemplates, deleteWhatsAppTemplate } from '../services/whatsapp.service';
import Template from '../models/Template';

export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await Template.findAll({
      where: { user_id: req.user!.id },
      order: [['createdAt', 'DESC']],
    });
    
    res.json({ templates: templates.map(t => t.toJSON()) });
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

    // Delete from WhatsApp first (if it exists there)
    try {
      await deleteWhatsAppTemplate(template.name);
      console.log('✅ Template deleted from WhatsApp');
    } catch (whatsappError: any) {
      // If template doesn't exist on WhatsApp (404), that's okay
      if (whatsappError.response?.status !== 404) {
        console.error('⚠️ Failed to delete from WhatsApp, but continuing:', whatsappError.message);
      }
    }

    // Delete from database
    await template.destroy();
    
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
