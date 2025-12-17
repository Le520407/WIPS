import { useState, useEffect } from 'react';
import { 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, TrendingUp, CheckCircle, Globe, Key } from 'lucide-react';

interface OverviewStats {
  websites: { total: number; active: number; inactive: number };
  apiKeys: { total: number; active: number; inactive: number };
  messages: { total: number; success: number; failed: number; successRate: string };
  apiUsage: { totalRequests: number; totalSuccess: number; totalErrors: number };
}

interface RealtimeStats {
  messagesLastHour: number;
  apiCallsLastHour: number;
  activeWebsites: number;
  timestamp: string;
}

export default function UsageDashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [realtime, setRealtime] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchRealtimeStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats/overview?days=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      }
      await fetchRealtimeStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const response = await fetch('/api/stats/realtime');
      const data = await response.json();
      if (data.success) {
        setRealtime(data.data);
      }
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
    }
  };



  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const messageChartData = [
    { name: 'Success', value: overview.messages.success, color: '#10b981' },
    { name: 'Failed', value: overview.messages.failed, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your multi-website integration platform</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Realtime Stats */}
      {realtime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Real-time Activity</h3>
            <span className="text-sm text-blue-600">
              (Last updated: {new Date(realtime.timestamp).toLocaleTimeString()})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Messages (Last Hour)</p>
              <p className="text-2xl font-bold text-blue-900">{realtime.messagesLastHour}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">API Calls (Last Hour)</p>
              <p className="text-2xl font-bold text-blue-900">{realtime.apiCallsLastHour}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Active Websites</p>
              <p className="text-2xl font-bold text-blue-900">{realtime.activeWebsites}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Websites */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Websites</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{overview.websites.total}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">✓ {overview.websites.active} active</span>
              <span className="text-gray-500">○ {overview.websites.inactive} inactive</span>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Key className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-500">API Keys</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{overview.apiKeys.total}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">✓ {overview.apiKeys.active} active</span>
              <span className="text-gray-500">○ {overview.apiKeys.inactive} inactive</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Messages</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{overview.messages.total}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">{overview.messages.successRate}% success</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>✓ {overview.messages.success}</span>
              <span>✗ {overview.messages.failed}</span>
            </div>
          </div>
        </div>

        {/* API Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-500">API Requests</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{overview.apiUsage.totalRequests}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-green-600">✓ {overview.apiUsage.totalSuccess}</span>
              <span className="text-red-600">✗ {overview.apiUsage.totalErrors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={messageChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {messageChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate</h3>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#10b981"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - parseFloat(overview.messages.successRate) / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">{overview.messages.successRate}%</p>
                    <p className="text-sm text-gray-500">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/websites"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Globe className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Websites</p>
              <p className="text-sm text-gray-500">Add or configure websites</p>
            </div>
          </a>
          <a
            href="/websites"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Key className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">API Keys</p>
              <p className="text-sm text-gray-500">Generate or revoke keys</p>
            </div>
          </a>
          <button
            onClick={fetchStats}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Refresh Stats</p>
              <p className="text-sm text-gray-500">Update dashboard data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
