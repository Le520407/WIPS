import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createWhatsAppTemplate, getWhatsAppTemplates } from '../services/whatsapp.service';

export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await getWhatsAppTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, language, category, components } = req.body;
    
    if (!name || !language || !category || !components) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await createWhatsAppTemplate({ name, language, category, components });
    
    res.json({ success: true, template: result });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Update template in database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Delete template from database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
