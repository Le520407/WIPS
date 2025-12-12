import { useState, useEffect } from 'react';
import { Users, Building2, Shield, Activity } from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  totalUsers: number;
  activeUsers: number;
  recentLogs: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Accounts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAccounts}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeAccounts} active
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeUsers} active
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-3xl font-bold text-green-600">Active</p>
              <p className="text-sm text-gray-600 mt-1">All systems operational</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Security</p>
              <p className="text-3xl font-bold text-blue-600">Secure</p>
              <p className="text-sm text-gray-600 mt-1">RBAC enabled</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          {stats.recentLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {stats.recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.User?.name || 'Unknown'}</span>
                      {' '}
                      <span className="text-gray-600">{log.action}</span>
                      {' '}
                      <span className="font-medium">{log.resource_type}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/accounts"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Building2 className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Accounts</h3>
          <p className="text-sm text-gray-600">
            Create, edit, and manage WhatsApp Business accounts
          </p>
        </a>

        <a
          href="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Users</h3>
          <p className="text-sm text-gray-600">
            Create users and assign them to accounts
          </p>
        </a>

        <a
          href="/admin/audit-logs"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Activity className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Audit Logs</h3>
          <p className="text-sm text-gray-600">
            View system activity and security logs
          </p>
        </a>
      </div>
    </div>
  );
}
