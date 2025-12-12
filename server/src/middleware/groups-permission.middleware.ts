/**
 * Groups Permission Middleware
 * 
 * Handles permission checks for Groups API operations
 */

import { Request, Response, NextFunction } from 'express';
import Group from '../models/Group';

/**
 * Check if user has access to the phone number
 */
export async function checkPhoneNumberAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { phoneNumberId } = req.query as { phoneNumberId?: string };
    
    if (!phoneNumberId) {
      return res.status(400).json({ error: 'Phone Number ID is required' });
    }

    // TODO: Implement actual user authentication and authorization
    // For now, we'll allow all requests
    // In production, you should:
    // 1. Get user from session/token
    // 2. Check if user has access to this phone number
    // 3. Check user's role and permissions
    
    // Example implementation:
    // const user = req.user; // From auth middleware
    // const hasAccess = await checkUserPhoneNumberAccess(user.id, phoneNumberId);
    // if (!hasAccess) {
    //   return res.status(403).json({ error: 'Access denied to this phone number' });
    // }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Permission check failed' });
  }
}

/**
 * Check if user has access to a specific group
 */
export async function checkGroupAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { phoneNumberId } = req.query as { phoneNumberId?: string };

    if (!phoneNumberId) {
      return res.status(400).json({ error: 'Phone Number ID is required' });
    }

    // Find the group
    const group = await Group.findOne({
      where: {
        id: id.includes('@g.us') ? undefined : id,
        group_id: id.includes('@g.us') ? id : undefined,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if the group belongs to the phone number
    if (group.phone_number_id !== phoneNumberId) {
      return res.status(403).json({ 
        error: 'Access denied: Group does not belong to this phone number' 
      });
    }

    // TODO: Additional user-level permission checks
    // const user = req.user;
    // const hasAccess = await checkUserGroupAccess(user.id, group.id);
    // if (!hasAccess) {
    //   return res.status(403).json({ error: 'Access denied to this group' });
    // }

    // Attach group to request for use in controller
    (req as any).group = group;

    next();
  } catch (error) {
    console.error('Group access check error:', error);
    res.status(500).json({ error: 'Access check failed' });
  }
}

/**
 * Check if user can perform admin operations
 */
export async function checkAdminPermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // TODO: Implement admin permission check
    // For now, we'll allow all requests
    // In production, you should:
    // 1. Get user from session/token
    // 2. Check if user has admin role
    // 3. Check specific admin permissions
    
    // Example implementation:
    // const user = req.user;
    // if (!user.isAdmin && !user.permissions.includes('groups.admin')) {
    //   return res.status(403).json({ error: 'Admin permission required' });
    // }

    next();
  } catch (error) {
    console.error('Admin permission check error:', error);
    res.status(500).json({ error: 'Permission check failed' });
  }
}

/**
 * Rate limiting for group operations
 */
const operationCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxOperations: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumberId } = req.query as { phoneNumberId?: string };
    
    if (!phoneNumberId) {
      return next();
    }

    const key = `${phoneNumberId}:${req.path}`;
    const now = Date.now();
    
    let record = operationCounts.get(key);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      operationCounts.set(key, record);
    }
    
    record.count++;
    
    if (record.count > maxOperations) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    next();
  };
}

/**
 * Validate group ownership before operations
 */
export async function validateGroupOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { phoneNumberId } = req.body.phoneNumberId || req.query.phoneNumberId;

    if (!phoneNumberId) {
      return res.status(400).json({ error: 'Phone Number ID is required' });
    }

    const group = await Group.findOne({
      where: {
        id: id.includes('@g.us') ? undefined : id,
        group_id: id.includes('@g.us') ? id : undefined,
        phone_number_id: phoneNumberId,
      },
    });

    if (!group) {
      return res.status(404).json({ 
        error: 'Group not found or access denied' 
      });
    }

    (req as any).group = group;
    next();
  } catch (error) {
    console.error('Ownership validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
}

/**
 * Log group operations for audit
 */
export function auditLog(operation: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumberId } = req.query as { phoneNumberId?: string };
    const { id } = req.params;
    
    // TODO: Implement proper audit logging
    // For now, just console log
    console.log(`[AUDIT] ${operation}`, {
      phoneNumberId,
      groupId: id,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // In production, save to database:
    // await AuditLog.create({
    //   operation,
    //   phoneNumberId,
    //   groupId: id,
    //   userId: req.user?.id,
    //   ip: req.ip,
    //   userAgent: req.get('user-agent'),
    // });
    
    next();
  };
}
