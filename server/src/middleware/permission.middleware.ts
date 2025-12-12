import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { User, Permission, RolePermission, AccountUser } from '../models';

// Check if user has specific permission
export const hasPermission = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findByPk(req.user!.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Super admin has all permissions
      if (user.role === 'super_admin') {
        return next();
      }

      // Check if user has permission through role
      const permission = await Permission.findOne({
        where: { name: permissionName },
      });

      if (!permission) {
        return res.status(403).json({ error: 'Permission not found' });
      }

      const rolePermission = await RolePermission.findOne({
        where: {
          role: user.role,
          permission_id: permission.id,
        },
      });

      if (rolePermission) {
        return next();
      }

      // Check if user has custom permission for current account
      const accountId = req.headers['x-account-id'] as string;
      if (accountId) {
        const accountUser = await AccountUser.findOne({
          where: {
            user_id: user.id,
            account_id: accountId,
          },
        });

        if (accountUser && accountUser.permissions.includes(permissionName)) {
          return next();
        }
      }

      return res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Check if user has specific role
export const hasRole = (roles: string | string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        console.error('❌ No user in request');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        console.error('❌ User not found:', req.user.id);
        return res.status(401).json({ error: 'User not found' });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      console.log('🔐 Role check:', {
        userRole: user.role,
        allowedRoles,
        matches: allowedRoles.includes(user.role),
      });
      
      if (allowedRoles.includes(user.role)) {
        return next();
      }

      return res.status(403).json({ error: 'Insufficient role' });
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Role check failed' });
    }
  };
};

// Check if user has access to account
export const hasAccountAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByPk(req.user!.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Super admin has access to all accounts
    if (user.role === 'super_admin') {
      return next();
    }

    const accountId = req.params.accountId || req.headers['x-account-id'] as string;
    
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    const accountUser = await AccountUser.findOne({
      where: {
        user_id: user.id,
        account_id: accountId,
      },
    });

    if (!accountUser) {
      return res.status(403).json({ error: 'No access to this account' });
    }

    // Attach account user info to request
    (req as any).accountUser = accountUser;
    
    return next();
  } catch (error) {
    console.error('Account access check error:', error);
    return res.status(500).json({ error: 'Access check failed' });
  }
};
