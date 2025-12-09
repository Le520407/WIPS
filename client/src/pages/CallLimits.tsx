import { useState, useEffect } from 'react';
import { Phone, AlertTriangle, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';
import api from '../services/api';

interface CallLimitSummary {
  total_contacts: number;
  active_contacts: number;
  limited_contacts: number;
  warning_contacts: number;
  total_calls_24h: number;
  total_limit: number;
  average_usage_percentage: number;
}

interface ContactLimit {
  phone_number: string;
  calls_24h: number;
  limit_24h: number;
  remaining?: number;
  usage_percentage: number;
  is_limited?: boolean;
  time_until_reset_ms?: number;
  last_call_at?: string;
}

interface DashboardData {
  summary: CallLimitSummary;
  needs_attention: ContactLimit[];
  most_active: ContactLimit[];
  environment: string;
  default_limit: number;
}

const CallLimits = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    // Refresh every minute
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/call/limits/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeUntilReset = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 bg-red-100';
    if (percentage >= 80) return 'text-orange-600 bg-orange-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Failed to load dashboard</div>
      </div>
    );
  }

  const { summary, needs_attention, most_active, environment, default_limit } = dashboard;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Limits Tracking</h1>
        <p className="text-gray-600">
          Monitor call usage and limits for all contacts
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {environment === 'sandbox' ? '🧪 Sandbox' : '🏭 Production'}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            Default limit: {default_limit} calls/24h
          </span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{summary.total_contacts}</span>
          </div>
          <p className="text-sm text-gray-600">Total Contacts</p>
          <p className="text-xs text-gray-500 mt-1">{summary.active_contacts} can make calls</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Phone className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{summary.total_calls_24h}</span>
          </div>
          <p className="text-sm text-gray-600">Calls (24h)</p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.average_usage_percentage}% average usage
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{summary.warning_contacts}</span>
          </div>
          <p className="text-sm text-gray-600">Warnings</p>
          <p className="text-xs text-gray-500 mt-1">≥80% usage</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{summary.limited_contacts}</span>
          </div>
          <p className="text-sm text-gray-600">Limited</p>
          <p className="text-xs text-gray-500 mt-1">Reached limit</p>
        </div>
      </div>

      {/* Needs Attention */}
      {needs_attention.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Needs Attention</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Contacts that are limited or approaching their limit
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Calls (24h)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reset In
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {needs_attention.map((contact) => (
                  <tr key={contact.phone_number} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${
                              contact.usage_percentage >= 100
                                ? 'bg-red-600'
                                : contact.usage_percentage >= 80
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                            }`}
                            style={{ width: `${Math.min(contact.usage_percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {contact.usage_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.calls_24h} / {contact.limit_24h}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.remaining || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contact.is_limited
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {contact.is_limited ? 'Limited' : 'Warning'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contact.time_until_reset_ms
                        ? formatTimeUntilReset(contact.time_until_reset_ms)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Most Active */}
      {most_active.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Most Active Contacts</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Contacts with the highest call volume in the last 24 hours
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Calls (24h)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Call
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {most_active.map((contact, index) => (
                  <tr key={contact.phone_number} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.calls_24h} / {contact.limit_24h}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getUsageColor(
                          contact.usage_percentage
                        )}`}
                      >
                        {contact.usage_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contact.last_call_at
                        ? new Date(contact.last_call_at).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">About Call Limits</h3>
            <p className="text-sm text-blue-800">
              {environment === 'sandbox' ? (
                <>
                  <strong>Sandbox Environment:</strong> Each contact can receive up to{' '}
                  {default_limit} business-initiated calls per 24-hour rolling window. This is for
                  testing purposes only.
                </>
              ) : (
                <>
                  <strong>Production Environment:</strong> Each contact can receive up to{' '}
                  {default_limit} business-initiated calls per 24-hour rolling window. This limit
                  resets automatically.
                </>
              )}
            </p>
            <p className="text-sm text-blue-800 mt-2">
              • <strong>Warning (80%):</strong> Contact is approaching their limit
              <br />• <strong>Limited (100%):</strong> Contact has reached their limit and cannot
              receive more calls until reset
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLimits;
