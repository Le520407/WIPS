import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsDashboard {
  period: string;
  summary: {
    total_calls: number;
    inbound_calls: number;
    outbound_calls: number;
    connected_calls: number;
    missed_calls: number;
    rejected_calls: number;
    pickup_rate: number;
    avg_duration: number;
  };
  daily_stats: Array<{
    date: string;
    total: number;
    inbound: number;
    outbound: number;
    connected: number;
    missed: number;
    rejected: number;
  }>;
  hourly_stats: Array<{
    hour: number;
    total: number;
    connected: number;
    missed: number;
  }>;
  top_contacts: Array<{
    phone_number: string;
    total_calls: number;
    inbound: number;
    outbound: number;
    connected: number;
    missed: number;
    total_duration: number;
  }>;
  quality_distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
  };
}

const CallAnalytics: React.FC = () => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/call/analytics/dashboard', {
        params: { period }
      });
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await api.get('/call/analytics/export', {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'calls.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'calls.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const qualityData = [
    { name: 'Excellent', value: dashboard.quality_distribution.excellent, color: '#10b981' },
    { name: 'Good', value: dashboard.quality_distribution.good, color: '#3b82f6' },
    { name: 'Fair', value: dashboard.quality_distribution.fair, color: '#f59e0b' },
    { name: 'Poor', value: dashboard.quality_distribution.poor, color: '#ef4444' },
    { name: 'Critical', value: dashboard.quality_distribution.critical, color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Analytics</h1>
          <p className="text-gray-600">Comprehensive call analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={() => exportData('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportData('json')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Calls</div>
          <div className="text-3xl font-bold text-gray-900">{dashboard.summary.total_calls}</div>
          <div className="text-sm text-gray-500 mt-1">
            ↑ {dashboard.summary.inbound_calls} In / ↓ {dashboard.summary.outbound_calls} Out
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pickup Rate</div>
          <div className="text-3xl font-bold text-green-600">{dashboard.summary.pickup_rate}%</div>
          <div className="text-sm text-gray-500 mt-1">
            {dashboard.summary.connected_calls} connected
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Missed Calls</div>
          <div className="text-3xl font-bold text-red-600">{dashboard.summary.missed_calls}</div>
          <div className="text-sm text-gray-500 mt-1">
            {dashboard.summary.rejected_calls} rejected
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Avg Duration</div>
          <div className="text-3xl font-bold text-blue-600">{dashboard.summary.avg_duration}s</div>
          <div className="text-sm text-gray-500 mt-1">
            per connected call
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Calls Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Daily Call Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.daily_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="connected" fill="#10b981" name="Connected" />
              <Bar dataKey="missed" fill="#ef4444" name="Missed" />
              <Bar dataKey="rejected" fill="#f59e0b" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Call Quality Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Distribution (only for 24h period) */}
      {period === '24h' && dashboard.hourly_stats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Hourly Call Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.hourly_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
              <Line type="monotone" dataKey="connected" stroke="#10b981" name="Connected" />
              <Line type="monotone" dataKey="missed" stroke="#ef4444" name="Missed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Contacts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Top Contacts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Calls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inbound</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outbound</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Connected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboard.top_contacts.map((contact, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.total_calls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {contact.inbound}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {contact.outbound}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {contact.connected}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {contact.missed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(contact.total_duration / 60)}m {contact.total_duration % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CallAnalytics;
