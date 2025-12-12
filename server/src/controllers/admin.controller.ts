import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Account, User, AccountUser, Permission, RolePermission, AuditLog } from '../models';
import bcrypt from 'bcrypt';

// ============ Account Management ============

// Get all accounts
export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    let accounts;
    
    if (user.role === 'super_admin') {
      // Super admin sees all accounts
      accounts = await Account.findAll({
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Other users see only their assigned accounts
      const accountUsers = await AccountUser.findAll({
        where: { user_id: user.id },
        include: [Account],
      });
      accounts = accountUsers.map((au: any) => au.Account);
    }

    res.json({ success: true, accounts });
  } catch (error: any) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
};

// Get single account
export const getAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const account = await Account.findByPk(id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get users assigned to this account
    const accountUsers = await AccountUser.findAll({
      where: { account_id: id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role', 'status'],
        },
      ],
    });

    res.json({ success: true, account, users: accountUsers });
  } catch (error: any) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to get account' });
  }
};

// Create account
export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      type,
      whatsapp_business_account_id,
      phone_number_id,
      access_token,
      settings,
    } = req.body;

    if (!name || !whatsapp_business_account_id || !phone_number_id || !access_token) {
      return res.status(400).json({
        error: 'Name, WABA ID, Phone Number ID, and Access Token required',
      });
    }

    const account = await Account.create({
      name,
      type: type || 'business',
      whatsapp_business_account_id,
      phone_number_id,
      access_token,
      status: 'active',
      settings: settings || {},
    });

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      account_id: account.id,
      action: 'create',
      resource_type: 'account',
      resource_id: account.id,
      details: { name, type },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true, account });
  } catch (error: any) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// Update account
export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status, settings, access_token, phone_number_id } = req.body;

    const account = await Account.findByPk(id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (status) updates.status = status;
    if (settings) updates.settings = settings;
    if (access_token) updates.access_token = access_token;
    if (phone_number_id) updates.phone_number_id = phone_number_id;

    await account.update(updates);

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      account_id: account.id,
      action: 'update',
      resource_type: 'account',
      resource_id: account.id,
      details: updates,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true, account });
  } catch (error: any) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// Delete account
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const account = await Account.findByPk(id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.destroy();

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      action: 'delete',
      resource_type: 'account',
      resource_id: id,
      details: { name: account.name },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// ============ User Management ============

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash', 'access_token'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, users });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Get single user
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'access_token'] },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's accounts
    const accountUsers = await AccountUser.findAll({
      where: { user_id: id },
      include: [Account],
    });

    res.json({ success: true, user, accounts: accountUsers });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Create user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash,
      name,
      role: role || 'agent',
      status: 'active',
    });

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      action: 'create',
      resource_type: 'user',
      resource_id: user.id,
      details: { email, name, role },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    const userResponse = user.toJSON();
    delete (userResponse as any).password_hash;
    delete (userResponse as any).access_token;

    res.json({ success: true, user: userResponse });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    await user.update(updates);

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      action: 'update',
      resource_type: 'user',
      resource_id: user.id,
      details: { ...updates, password_hash: undefined },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    const userResponse = user.toJSON();
    delete (userResponse as any).password_hash;
    delete (userResponse as any).access_token;

    res.json({ success: true, user: userResponse });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot delete super admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    await user.destroy();

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      action: 'delete',
      resource_type: 'user',
      resource_id: id,
      details: { email: user.email, name: user.name },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ============ Account-User Assignment ============

// Assign user to account
export const assignUserToAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    const { user_id, role, permissions } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Check if assignment already exists
    const existing = await AccountUser.findOne({
      where: { account_id: accountId, user_id },
    });

    if (existing) {
      return res.status(400).json({ error: 'User already assigned to this account' });
    }

    const accountUser = await AccountUser.create({
      account_id: accountId,
      user_id,
      role: role || 'agent',
      permissions: permissions || [],
    });

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      account_id: accountId,
      action: 'assign',
      resource_type: 'account_user',
      resource_id: accountUser.id.toString(),
      details: { user_id, role, permissions },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true, accountUser });
  } catch (error: any) {
    console.error('Assign user error:', error);
    res.status(500).json({ error: 'Failed to assign user' });
  }
};

// Remove user from account
export const removeUserFromAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, userId } = req.params;

    const accountUser = await AccountUser.findOne({
      where: { account_id: accountId, user_id: userId },
    });

    if (!accountUser) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await accountUser.destroy();

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      account_id: accountId,
      action: 'remove',
      resource_type: 'account_user',
      resource_id: accountUser.id.toString(),
      details: { user_id: userId },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Remove user error:', error);
    res.status(500).json({ error: 'Failed to remove user' });
  }
};

// Update user role in account
export const updateAccountUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, userId } = req.params;
    const { role, permissions } = req.body;

    const accountUser = await AccountUser.findOne({
      where: { account_id: accountId, user_id: userId },
    });

    if (!accountUser) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const updates: any = {};
    if (role) updates.role = role;
    if (permissions) updates.permissions = permissions;

    await accountUser.update(updates);

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      account_id: accountId,
      action: 'update',
      resource_type: 'account_user',
      resource_id: accountUser.id.toString(),
      details: updates,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true, accountUser });
  } catch (error: any) {
    console.error('Update account user error:', error);
    res.status(500).json({ error: 'Failed to update account user' });
  }
};

// ============ Permission Management ============

// Get all permissions
export const getPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    
    const where: any = {};
    if (category) where.category = category;

    const permissions = await Permission.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    res.json({ success: true, permissions });
  } catch (error: any) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
};

// Get role permissions
export const getRolePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.params;

    const rolePermissions = await RolePermission.findAll({
      where: { role },
      include: [Permission],
    });

    const permissions = rolePermissions.map((rp: any) => rp.Permission);

    res.json({ success: true, role, permissions });
  } catch (error: any) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ error: 'Failed to get role permissions' });
  }
};

// Update role permissions
export const updateRolePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.params;
    const { permission_ids } = req.body;

    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({ error: 'permission_ids must be an array' });
    }

    // Delete existing permissions
    await RolePermission.destroy({ where: { role } });

    // Create new permissions
    const rolePermissions = await Promise.all(
      permission_ids.map((permission_id: number) =>
        RolePermission.create({ role, permission_id })
      )
    );

    // Log action
    await AuditLog.create({
      user_id: req.user!.id,
      action: 'update',
      resource_type: 'role_permissions',
      resource_id: role,
      details: { permission_ids },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true, rolePermissions });
  } catch (error: any) {
    console.error('Update role permissions error:', error);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
};

// ============ Audit Logs ============

// Get audit logs
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, account_id, action, resource_type, limit = 100 } = req.query;
    
    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (account_id) where.account_id = account_id;
    if (action) where.action = action;
    if (resource_type) where.resource_type = resource_type;

    const logs = await AuditLog.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Account,
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string),
    });

    res.json({ success: true, logs });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
};

// ============ Dashboard Stats ============

// Get admin dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalAccounts,
      activeAccounts,
      totalUsers,
      activeUsers,
      recentLogs,
    ] = await Promise.all([
      Account.count(),
      Account.count({ where: { status: 'active' } }),
      User.count(),
      User.count({ where: { status: 'active' } }),
      AuditLog.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
          },
        ],
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalAccounts,
        activeAccounts,
        totalUsers,
        activeUsers,
        recentLogs,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};
