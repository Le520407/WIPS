import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface SipStatusData {
  configured: boolean;
  enabled: boolean;
  server_count: number;
  servers: Array<{
    hostname: string;
    port: number;
  }>;
  srtp_protocol: string;
  last_synced: string | null;
  has_password: boolean;
  sip_domain: string;
  warning: string | null;
}

const SipStatus: React.FC = () => {
  const [status, setStatus] = useState<SipStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStatus();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/sip/status');
      setStatus(response.data);
    } catch (err: any) {
      console.error('Failed to load SIP status:', err);
      setError(err.response?.data?.error || 'Failed to load SIP status');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading SIP status...</div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadStatus}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">SIP Status Monitor</h1>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {status?.warning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-medium">⚠️ {status.warning}</p>
          </div>
        )}

        {/* Overall Status */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Overall Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-1">Configuration</div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    status?.configured ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-semibold">
                  {status?.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-1">SIP Status</div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    status?.enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="font-semibold">
                  {status?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-1">Servers</div>
              <div className="text-2xl font-bold text-blue-600">
                {status?.server_count || 0}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-1">Password</div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    status?.has_password ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-semibold">
                  {status?.has_password ? 'Set' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Server Details */}
        {status?.servers && status.servers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">SIP Servers</h2>
            <div className="space-y-3">
              {status.servers.map((server, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{server.hostname}</div>
                      <div className="text-sm text-gray-600">Port: {server.port}</div>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">SIP Domain:</span>
              <span className="font-mono">{status?.sip_domain || 'wa.meta.vc'}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">SRTP Protocol:</span>
              <span className="font-mono">{status?.srtp_protocol || 'DTLS'}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Last Synced:</span>
              <span>
                {status?.last_synced
                  ? new Date(status.last_synced).toLocaleString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/sip-settings"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Configure SIP
            </a>
            {status?.configured && (
              <>
                <button
                  onClick={() => window.location.href = '/sip-settings'}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  View Settings
                </button>
                <button
                  onClick={loadStatus}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh Status
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">Status Indicators</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span>Active / Configured / Enabled</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-2" />
              <span>Inactive / Disabled</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2" />
              <span>Error / Not Configured</span>
            </div>
          </div>
        </div>

        {/* Auto Refresh Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Status auto-refreshes every 30 seconds
        </div>
      </div>
    </div>
  );
};

export default SipStatus;
