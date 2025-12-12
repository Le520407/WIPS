import { Request, Response, NextFunction } from 'express';
import ApiKey from '../models/ApiKey';
import Website from '../models/Website';
import ApiUsage from '../models/ApiUsage';

// Extend Request type to include website info
export interface ApiKeyRequest extends Request {
  website?: {
    id: string;
    apiKeyId: string;
    phoneNumberId: string;
  };
}

/**
 * Middleware to authenticate API requests using API keys
 * Usage: Add to routes that require API key authentication
 */
export async function apiKeyAuth(req: ApiKeyRequest, res: Response, next: NextFunction) {
  try {
    // Get API key from header
    const apiKeyHeader = req.headers['x-api-key'] as string || 
                        (req.headers['authorization'] as string)?.replace('Bearer ', '');
    
    if (!apiKeyHeader) {
      return res.status(401).json({ 
        error: 'API key is required',
        message: 'Please provide an API key in the X-API-Key header or Authorization header'
      });
    }
    
    // Find and validate API key
    const keyRecord = await ApiKey.findOne({
      where: { 
        api_key: apiKeyHeader,
        is_active: true 
      }
    });
    
    if (!keyRecord) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      });
    }
    
    // Check if key has expired
    if (keyRecord.expires_at && new Date() > new Date(keyRecord.expires_at)) {
      return res.status(401).json({ 
        error: 'API key has expired',
        message: 'Please generate a new API key'
      });
    }
    
    // Get website info
    const website = await Website.findByPk(keyRecord.website_id);
    
    if (!website) {
      return res.status(403).json({ 
        error: 'Website not found',
        message: 'The website associated with this API key no longer exists'
      });
    }
    
    if (!website.is_active) {
      return res.status(403).json({ 
        error: 'Website is inactive',
        message: 'This website has been disabled'
      });
    }
    
    // Check rate limit
    const isWithinLimit = await checkRateLimit(keyRecord.id, keyRecord.rate_limit);
    if (!isWithinLimit) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `You have exceeded the rate limit of ${keyRecord.rate_limit} requests per hour`
      });
    }
    
    // Record usage
    await recordUsage(keyRecord.id, keyRecord.website_id, req.path, true);
    
    // Update last used timestamp
    await keyRecord.update({ last_used_at: new Date() });
    
    // Attach website info to request
    req.website = {
      id: keyRecord.website_id,
      apiKeyId: keyRecord.id,
      phoneNumberId: website.phone_number_id
    };
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    
    // Record failed usage if we have the key ID
    if (req.website?.apiKeyId) {
      await recordUsage(req.website.apiKeyId, req.website.id, req.path, false);
    }
    
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred while authenticating your request'
    });
  }
}

/**
 * Check if the API key is within its rate limit
 */
async function checkRateLimit(apiKeyId: string, rateLimit: number): Promise<boolean> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get usage in the last hour
    const usage = await ApiUsage.findAll({
      where: {
        api_key_id: apiKeyId,
        created_at: {
          $gte: oneHourAgo
        }
      }
    });
    
    const totalRequests = usage.reduce((sum, record) => sum + record.request_count, 0);
    
    return totalRequests < rateLimit;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow the request (fail open)
    return true;
  }
}

/**
 * Record API usage for statistics
 */
async function recordUsage(
  apiKeyId: string, 
  websiteId: string, 
  endpoint: string,
  success: boolean
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create usage record for today
    const [usage] = await ApiUsage.findOrCreate({
      where: {
        api_key_id: apiKeyId,
        website_id: websiteId,
        endpoint,
        date: today
      },
      defaults: {
        request_count: 0,
        success_count: 0,
        error_count: 0
      }
    });
    
    // Update counts
    await usage.increment({
      request_count: 1,
      success_count: success ? 1 : 0,
      error_count: success ? 0 : 1
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    // Don't throw - usage recording should not block requests
  }
}

/**
 * Optional: Middleware to check specific rate limit for an endpoint
 */
export function rateLimitByEndpoint(limit: number, windowMs: number = 60000) {
  const requests = new Map<string, number[]>();
  
  return (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    if (!req.website?.apiKeyId) {
      return next();
    }
    
    const key = `${req.website.apiKeyId}:${req.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    let keyRequests = requests.get(key) || [];
    
    // Filter out old requests
    keyRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (keyRequests.length >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests to ${req.path}. Please try again later.`
      });
    }
    
    // Add current request
    keyRequests.push(now);
    requests.set(key, keyRequests);
    
    next();
  };
}
