import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AutoReplyRule } from '../models';

export const getRules = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const rules = await AutoReplyRule.findAll({
      where: { user_id },
      order: [['priority', 'ASC']],
    });
    res.json({ success: true, rules });
  } catch (error: any) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: 'Failed to get rules' });
  }
};

export const createRule = async (req: AuthRequest, res: Response) => {
  try {
    const { name, trigger_type, trigger_value, reply_message, is_active, priority, userId } = req.body;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!name || !trigger_type || !reply_message) {
      return res.status(400).json({ error: 'Name, trigger type, and reply message are required' });
    }

    const rule = await AutoReplyRule.create({
      user_id,
      name,
      trigger_type,
      trigger_value,
      reply_message,
      is_active: is_active !== undefined ? is_active : true,
      priority: priority || 0,
    });

    res.json({ success: true, rule });
  } catch (error: any) {
    console.error('Create rule error:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const updateRule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, trigger_type, trigger_value, reply_message, is_active, priority, userId } = req.body;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const rule = await AutoReplyRule.findOne({ where: { id, user_id } });
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await rule.update({ name, trigger_type, trigger_value, reply_message, is_active, priority });
    res.json({ success: true, rule });
  } catch (error: any) {
    console.error('Update rule error:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const deleted = await AutoReplyRule.destroy({ where: { id, user_id } });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

export const toggleRule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user_id = userId || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const rule = await AutoReplyRule.findOne({ where: { id, user_id } });
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await rule.update({ is_active: !rule.is_active });
    res.json({ success: true, rule });
  } catch (error: any) {
    console.error('Toggle rule error:', error);
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
};
