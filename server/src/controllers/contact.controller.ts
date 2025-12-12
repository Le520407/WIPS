import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Contact, ContactLabel } from '../models';

export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const { search, labelId, userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const where: any = { user_id };

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { phone_number: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
      ];
    }

    if (labelId) {
      where.labels = { [require('sequelize').Op.contains]: [parseInt(labelId as string)] };
    }

    const contacts = await Contact.findAll({ where, order: [['name', 'ASC']] });
    res.json({ success: true, contacts });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
};

export const createOrUpdateContact = async (req: AuthRequest, res: Response) => {
  try {
    const { phone_number, name, notes, labels, userId } = req.body;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const [contact, created] = await Contact.findOrCreate({
      where: { user_id, phone_number },
      defaults: { name, notes, labels: labels || [] },
    });

    if (!created) {
      await contact.update({ name, notes, labels: labels || [] });
    }

    res.json({ success: true, contact, created });
  } catch (error: any) {
    console.error('Create/update contact error:', error);
    res.status(500).json({ error: 'Failed to save contact' });
  }
};

export const deleteContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const deleted = await Contact.destroy({ where: { id, user_id } });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

export const getLabels = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const labels = await ContactLabel.findAll({ where: { user_id } });
    res.json({ success: true, labels });
  } catch (error: any) {
    console.error('Get labels error:', error);
    res.status(500).json({ error: 'Failed to get labels' });
  }
};

export const createLabel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, color, userId } = req.body;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Label name is required' });
    }

    const label = await ContactLabel.create({
      user_id,
      name,
      color: color || '#3b82f6',
    });

    res.json({ success: true, label });
  } catch (error: any) {
    console.error('Create label error:', error);
    res.status(500).json({ error: 'Failed to create label' });
  }
};

export const updateLabel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, userId } = req.body;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const label = await ContactLabel.findOne({ where: { id, user_id } });
    
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    await label.update({ name, color });
    res.json({ success: true, label });
  } catch (error: any) {
    console.error('Update label error:', error);
    res.status(500).json({ error: 'Failed to update label' });
  }
};

export const deleteLabel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const deleted = await ContactLabel.destroy({ where: { id, user_id } });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete label error:', error);
    res.status(500).json({ error: 'Failed to delete label' });
  }
};
