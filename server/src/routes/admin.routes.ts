import express from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignUserToAccount,
  removeUserFromAccount,
  updateAccountUserRole,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  getAuditLogs,
  getDashboardStats,
} from '../controllers/admin.controller';
import { hasRole, hasAccountAccess } from '../middleware/permission.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', hasRole(['super_admin', 'admin']), getDashboardStats);

// Account Management
router.get('/accounts', hasRole(['super_admin', 'admin']), getAccounts);
router.get('/accounts/:id', hasRole(['super_admin', 'admin']), getAccount);
router.post('/accounts', hasRole('super_admin'), createAccount);
router.put('/accounts/:id', hasRole('super_admin'), updateAccount);
router.delete('/accounts/:id', hasRole('super_admin'), deleteAccount);

// User Management
router.get('/users', hasRole(['super_admin', 'admin']), getUsers);
router.get('/users/:id', hasRole(['super_admin', 'admin']), getUser);
router.post('/users', hasRole(['super_admin', 'admin']), createUser);
router.put('/users/:id', hasRole(['super_admin', 'admin']), updateUser);
router.delete('/users/:id', hasRole('super_admin'), deleteUser);

// Account-User Assignment
router.post('/accounts/:accountId/users', hasRole(['super_admin', 'admin']), assignUserToAccount);
router.delete('/accounts/:accountId/users/:userId', hasRole(['super_admin', 'admin']), removeUserFromAccount);
router.put('/accounts/:accountId/users/:userId', hasRole(['super_admin', 'admin']), updateAccountUserRole);

// Permission Management
router.get('/permissions', hasRole(['super_admin', 'admin']), getPermissions);
router.get('/roles/:role/permissions', hasRole('super_admin'), getRolePermissions);
router.put('/roles/:role/permissions', hasRole('super_admin'), updateRolePermissions);

// Audit Logs
router.get('/audit-logs', hasRole(['super_admin', 'admin']), getAuditLogs);

export default router;
