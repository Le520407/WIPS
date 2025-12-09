import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface QualityMetrics {
  phone_number: string;
  total_calls: number;
  connected_calls: number;
  missed_calls: number;
  rejected_calls: number;
  failed_calls: number;
  consecutive_missed: number;
  consecutive_connected: number;
  pickup_rate: number;
  quality_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  warning_sent: boolean;
  needs_warning: boolean;
  needs_revocation: boolean;
  last_call_at?: string;
}

interface DashboardData {
  summary: {
    total_contacts: number;
    total_calls: number;
    total_connected: number;
    total_missed: number;
    overall_pickup_rate: number;
  };
  quality_distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
  };
  needs_attention: Array<{
    phone_number: string;
    consecutive_missed: number;
    pickup_rate: number;
    quality_status: string;
    needs_warning: boolean;
    needs_revocation: boolean;
    last_call_at?: string;
  }>;
  top_performers: Array<{
    phone_number: string;
    pickup_rate: number;
    total_calls: number;
    connected_calls: number;
  }>;
  call_trends: Array<{
    date: string;
    total: number;
    connected: number;
    missed: number;
    pickup_rate: number;
  }>;
  recent_calls: Array<{
    id: number;
    from_number: string;
    to_number: string;
    status: string;
    direction: string;
    created_at: string;
  }>;
}

const CallQualityMonitor: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/call/quality/dashboard');
      setDashboard(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetWarning = async (phoneNumber: string) => {
    try {
      await api.post(`/call/quality/${phoneNumber}/reset-warning`);
      fetchDashboard(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reset warning');
    }
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQualityBadge = (status: string) => {
    const color = getQualityColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Quality Monitor</h1>
          <p className="text-gray-600 mt-1">Track call performance and pickup rates</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Contacts</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {dashboard.summary.total_contacts}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Calls</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {dashboard.summary.total_calls}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Connected</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {dashboard.summary.total_connected}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Missed</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {dashboard.summary.total_missed}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Pickup Rate</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {dashboard.summary.overall_pickup_rate}%
          </div>
        </div>
      </div>

      {/* Quality Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dashboard.quality_distribution.excellent}
            </div>
            <div className="text-sm text-gray-600 mt-1">Excellent</div>
            <div className="text-xs text-gray-500">(≥90%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboard.quality_distribution.good}
            </div>
            <div className="text-sm text-gray-600 mt-1">Good</div>
            <div className="text-xs text-gray-500">(75-89%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {dashboard.quality_distribution.fair}
            </div>
            <div className="text-sm text-gray-600 mt-1">Fair</div>
            <div className="text-xs text-gray-500">(60-74%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {dashboard.quality_distribution.poor}
            </div>
            <div className="text-sm text-gray-600 mt-1">Poor</div>
            <div className="text-xs text-gray-500">(40-59%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {dashboard.quality_distribution.critical}
            </div>
            <div className="text-sm text-gray-600 mt-1">Critical</div>
            <div className="text-xs text-gray-500">(&lt;40%)</div>
          </div>
        </div>
      </div>

      {/* Needs Attention */}
      {dashboard.needs_attention.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4">
            ⚠️ Contacts Needing Attention ({dashboard.needs_attention.length})
          </h2>
          <div className="space-y-3">
            {dashboard.needs_attention.map((contact) => (
              <div
                key={contact.phone_number}
                className="bg-white rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{contact.phone_number}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {contact.consecutive_missed} consecutive missed calls • 
                    Pickup rate: {contact.pickup_rate}%
                  </div>
                  {contact.needs_revocation && (
                    <div className="text-sm text-red-600 font-medium mt-1">
                      🚨 Permission will be revoked automatically
                    </div>
                  )}
                  {contact.needs_warning && !contact.needs_revocation && (
                    <div className="text-sm text-orange-600 font-medium mt-1">
                      ⚠️ Warning threshold reached
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getQualityBadge(contact.quality_status)}
                  <button
                    onClick={() => resetWarning(contact.phone_number)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {dashboard.top_performers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏆 Top Performers
          </h2>
          <div className="space-y-3">
            {dashboard.top_performers.map((contact, index) => (
              <div
                key={contact.phone_number}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-gray-900">{contact.phone_number}</div>
                    <div className="text-sm text-gray-600">
                      {contact.connected_calls}/{contact.total_calls} calls answered
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {contact.pickup_rate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Trends (Last 7 Days)</h2>
        <div className="space-y-2">
          {dashboard.call_trends.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-600">{day.date}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${day.total > 0 ? (day.connected / day.total) * 100 : 0}%` }}
                  >
                    {day.connected > 0 && `${day.connected}`}
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {day.pickup_rate}%
                </div>
              </div>
              <div className="w-32 text-sm text-gray-600 text-right">
                {day.total} calls ({day.connected} connected, {day.missed} missed)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Calls */}
      {dashboard.recent_calls.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Calls</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboard.recent_calls.map((call) => (
                  <tr key={call.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{call.from_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{call.to_number}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        call.direction === 'incoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {call.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        call.status === 'ended' || call.status === 'answered' 
                          ? 'bg-green-100 text-green-700'
                          : call.status === 'missed' || call.status === 'no_answer'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallQualityMonitor;
