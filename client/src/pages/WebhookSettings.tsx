import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface WebhookConfig {
  callbackUrl: string;
  verifyToken: string;
  subscribedFields: string[];
  wabaOverride?: {
    url: string;
    token: string;
  };
  phoneOverride?: {
    url: string;
    token: string;
  };
}

interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  status: 'success' | 'failed';
  payload: any;
  error?: string;
}

const WebhookSettings: React.FC = () => {
  const [config, setConfig] = useState<WebhookConfig>({
    callbackUrl: '',
    verifyToken: '',
    subscribedFields: [],
  });
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'override' | 'logs'>('config');

  const availableFields = [
    { id: 'messages', name: 'Messages', description: 'Receive incoming messages' },
    { id: 'message_status', name: 'Message Status', description: 'Receive message delivery status updates' },
    { id: 'message_template_status_update', name: 'Template Status', description: 'Receive template approval status' },
    { id: 'account_alerts', name: 'Account Alerts', description: 'Receive account-level alerts' },
    { id: 'account_update', name: 'Account Update', description: 'Receive account update notifications' },
    { id: 'phone_number_quality_update', name: 'Quality Update', description: 'Receive phone number quality updates' },
  ];

  useEffect(() => {
    loadWebhookConfig();
    loadWebhookLogs();
  }, []);

  const loadWebhookConfig = async () => {
    try {
      const response = await api.get('/webhooks/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to load webhook config:', error);
    }
  };

  const loadWebhookLogs = async () => {
    try {
      const response = await api.get('/webhooks/logs');
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to load webhook logs:', error);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await api.post('/webhooks/config', config);
      alert('Webhook configuration saved successfully!');
    } catch (error: any) {
      alert('Failed to save webhook configuration: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    setLoading(true);
    try {
      const response = await api.post('/webhooks/test');
      alert('Test webhook sent! Check your endpoint logs.');
    } catch (error: any) {
      alert('Failed to send test webhook: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSetWABAOverride = async () => {
    if (!config.wabaOverride?.url || !config.wabaOverride?.token) {
      alert('Please enter both URL and verify token');
      return;
    }
    setLoading(true);
    try {
      await api.post('/webhooks/waba-override', config.wabaOverride);
      alert('WABA webhook override set successfully!');
    } catch (error: any) {
      alert('Failed to set WABA override: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPhoneOverride = async () => {
    if (!config.phoneOverride?.url || !config.phoneOverride?.token) {
      alert('Please enter both URL and verify token');
      return;
    }
    setLoading(true);
    try {
      await api.post('/webhooks/phone-override', config.phoneOverride);
      alert('Phone number webhook override set successfully!');
    } catch (error: any) {
      alert('Failed to set phone override: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWABAOverride = async () => {
    if (!confirm('Are you sure you want to delete the WABA webhook override?')) return;
    setLoading(true);
    try {
      await api.delete('/webhooks/waba-override');
      setConfig({ ...config, wabaOverride: undefined });
      alert('WABA webhook override deleted successfully!');
    } catch (error: any) {
      alert('Failed to delete WABA override: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoneOverride = async () => {
    if (!confirm('Are you sure you want to delete the phone number webhook override?')) return;
    setLoading(true);
    try {
      await api.delete('/webhooks/phone-override');
      setConfig({ ...config, phoneOverride: undefined });
      alert('Phone number webhook override deleted successfully!');
    } catch (error: any) {
      alert('Failed to delete phone override: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (fieldId: string) => {
    const newFields = config.subscribedFields.includes(fieldId)
      ? config.subscribedFields.filter(f => f !== fieldId)
      : [...config.subscribedFields, fieldId];
    setConfig({ ...config, subscribedFields: newFields });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Webhook Settings</h1>
        <p className="text-gray-600 mt-1">Configure and manage your WhatsApp webhooks</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('override')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'override'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Webhook Overrides
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Webhook Logs
          </button>
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Callback URL
                </label>
                <input
                  type="url"
                  value={config.callbackUrl}
                  onChange={(e) => setConfig({ ...config, callbackUrl: e.target.value })}
                  placeholder="https://your-domain.com/webhooks/whatsapp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your public HTTPS endpoint that will receive webhook events
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify Token
                </label>
                <input
                  type="text"
                  value={config.verifyToken}
                  onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
                  placeholder="your_verify_token_123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  A secret token used to verify webhook requests
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  onClick={handleTestWebhook}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Test Webhook
                </button>
              </div>
            </div>
          </div>

          {/* Subscribed Fields */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Subscribed Webhook Fields</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select which events you want to receive webhooks for
            </p>

            <div className="space-y-3">
              {availableFields.map((field) => (
                <label key={field.id} className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.subscribedFields.includes(field.id)}
                    onChange={() => toggleField(field.id)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{field.name}</div>
                    <div className="text-sm text-gray-500">{field.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Enter your public HTTPS callback URL above</li>
              <li>Set a secure verify token (save it in your server's environment variables)</li>
              <li>Click "Save Configuration" to update Meta's webhook settings</li>
              <li>Select the webhook fields you want to subscribe to</li>
              <li>Click "Test Webhook" to verify your endpoint is working</li>
            </ol>
          </div>
        </div>
      )}

      {/* Override Tab */}
      {activeTab === 'override' && (
        <div className="space-y-6">
          {/* WABA Override */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">WABA Webhook Override</h2>
            <p className="text-sm text-gray-600 mb-4">
              Set an alternate callback URL for your WhatsApp Business Account
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Override Callback URL
                </label>
                <input
                  type="url"
                  value={config.wabaOverride?.url || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    wabaOverride: { ...config.wabaOverride, url: e.target.value, token: config.wabaOverride?.token || '' }
                  })}
                  placeholder="https://waba-alternate.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify Token
                </label>
                <input
                  type="text"
                  value={config.wabaOverride?.token || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    wabaOverride: { ...config.wabaOverride, token: e.target.value, url: config.wabaOverride?.url || '' }
                  })}
                  placeholder="waba_verify_token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSetWABAOverride}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Set WABA Override
                </button>
                {config.wabaOverride && (
                  <button
                    onClick={handleDeleteWABAOverride}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete Override
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number Override */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Phone Number Webhook Override</h2>
            <p className="text-sm text-gray-600 mb-4">
              Set an alternate callback URL for a specific phone number
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Override Callback URL
                </label>
                <input
                  type="url"
                  value={config.phoneOverride?.url || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    phoneOverride: { ...config.phoneOverride, url: e.target.value, token: config.phoneOverride?.token || '' }
                  })}
                  placeholder="https://phone-alternate.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify Token
                </label>
                <input
                  type="text"
                  value={config.phoneOverride?.token || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    phoneOverride: { ...config.phoneOverride, token: e.target.value, url: config.phoneOverride?.url || '' }
                  })}
                  placeholder="phone_verify_token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSetPhoneOverride}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Set Phone Override
                </button>
                {config.phoneOverride && (
                  <button
                    onClick={handleDeletePhoneOverride}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete Override
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Override Priority Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">ℹ️ Webhook Priority</h3>
            <p className="text-sm text-yellow-800">
              When a webhook is triggered, Meta checks in this order:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800 mt-2 ml-4">
              <li>Phone Number Override (highest priority)</li>
              <li>WABA Override</li>
              <li>App Callback URL (fallback)</li>
            </ol>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Webhook Events</h2>
            <button
              onClick={loadWebhookLogs}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No webhook events received yet
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{log.type}</span>
                        <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      {log.error && (
                        <div className="text-sm text-red-600 mb-2">Error: {log.error}</div>
                      )}
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                          View payload
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebhookSettings;
