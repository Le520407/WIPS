import { Request, Response } from 'express';
import Website from '../models/Website';
import ApiKey from '../models/ApiKey';
import ApiUsage from '../models/ApiUsage';
import crypto from 'crypto';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Generate API key
function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24);
  return 'wsk_' + randomBytes.toString('base64url');
}

// Generate API secret
function generateApiSecret(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Get all websites
export async function getWebsites(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    const websites = await Website.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
    
    // Get API key counts for each website
    for (const website of websites) {
      const apiKeys = await ApiKey.findAll({
        where: { website_id: website.id },
        attributes: ['id', 'key_name', 'is_active', 'created_at'],
      });
      (website as any).ApiKeys = apiKeys;
    }
    
    res.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
}

// Get single website
export async function getWebsite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    const website = await Website.findOne({
      where: { id, user_id: userId },
    });
    
    if (website) {
      const apiKeys = await ApiKey.findAll({
        where: { website_id: website.id },
      });
      (website as any).ApiKeys = apiKeys;
    }
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    res.json({ website });
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
}

// Create website
export async function createWebsite(req: AuthRequest, res: Response) {
  try {
    const { name, domain, description, phone_number_id, webhook_url, webhook_secret } = req.body;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    if (!name || !phone_number_id) {
      return res.status(400).json({ error: 'Name and phone_number_id are required' });
    }
    
    const website = await Website.create({
      user_id: userId,
      name,
      domain,
      description,
      phone_number_id,
      webhook_url,
      webhook_secret,
      is_active: true,
    });
    
    res.status(201).json({ website });
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({ error: 'Failed to create website' });
  }
}

// Update website
export async function updateWebsite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, domain, description, phone_number_id, webhook_url, webhook_secret, is_active } = req.body;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    const website = await Website.findOne({
      where: { id, user_id: userId },
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    await website.update({
      name,
      domain,
      description,
      phone_number_id,
      webhook_url,
      webhook_secret,
      is_active,
    });
    
    res.json({ website });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({ error: 'Failed to update website' });
  }
}

// Delete website
export async function deleteWebsite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    const website = await Website.findOne({
      where: { id, user_id: userId },
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    await website.destroy();
    
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
}

// Get API keys for a website
export async function getApiKeys(req: AuthRequest, res: Response) {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    // Verify website belongs to user
    const website = await Website.findOne({
      where: { id: websiteId, user_id: userId },
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    const apiKeys = await ApiKey.findAll({
      where: { website_id: websiteId },
      order: [['created_at', 'DESC']],
    });
    
    res.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
}

// Generate new API key
export async function generateKey(req: AuthRequest, res: Response) {
  try {
    const { websiteId } = req.params;
    const { key_name, rate_limit, expires_at } = req.body;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    // Verify website belongs to user
    const website = await Website.findOne({
      where: { id: websiteId, user_id: userId },
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    if (!key_name) {
      return res.status(400).json({ error: 'key_name is required' });
    }
    
    const apiKey = await ApiKey.create({
      website_id: websiteId,
      key_name,
      api_key: generateApiKey(),
      api_secret: generateApiSecret(),
      is_active: true,
      rate_limit: rate_limit || 1000,
      expires_at: expires_at || null,
    });
    
    res.status(201).json({ apiKey });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
}

// Revoke API key
export async function revokeKey(req: AuthRequest, res: Response) {
  try {
    const { keyId } = req.params;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    // Find API key and verify ownership through website
    const apiKey = await ApiKey.findByPk(keyId);
    
    if (apiKey) {
      const website = await Website.findOne({
        where: { id: apiKey.website_id, user_id: userId },
      });
      
      if (!website) {
        return res.status(404).json({ error: 'API key not found' });
      }
    }
    
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    await apiKey.update({ is_active: false });
    
    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
}

// Get usage statistics for a website
export async function getUsageStats(req: AuthRequest, res: Response) {
  try {
    const { websiteId } = req.params;
    const { period = 'month' } = req.query;
    const userId = req.user?.id || '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    
    // Verify website belongs to user
    const website = await Website.findOne({
      where: { id: websiteId, user_id: userId },
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const usage = await ApiUsage.findAll({
      where: {
        website_id: websiteId,
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0],
        },
      },
      order: [['date', 'ASC']],
    });
    
    // Calculate totals
    const totals = usage.reduce(
      (acc, record) => ({
        requests: acc.requests + record.request_count,
        success: acc.success + record.success_count,
        errors: acc.errors + record.error_count,
      }),
      { requests: 0, success: 0, errors: 0 }
    );
    
    res.json({
      usage,
      totals,
      successRate: totals.requests > 0 ? (totals.success / totals.requests) * 100 : 0,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
}
