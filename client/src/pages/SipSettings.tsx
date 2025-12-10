import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface SipServer {
  hostname: string;
  port: number;
  request_uri_user_params?: { [key: string]: string };
}

interface SipConfig {
  id: string;
  sip_enabled: boolean;
  sip_servers: SipServer[];
  sip_user_password?: string;
  srtp_key_exchange_protocol: 'DTLS' | 'SDES';
  last_synced_at: string | null;
}

const SipSettings: React.FC = () => {
  const [config, setConfig] = useState<SipConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState<string>('');
  
  // Form state
  const [sipEnabled, setSipEnabled] = useState(false);
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState(5061);
  const [srtpProtocol, setSrtpProtocol] = useState<'DTLS' | 'SDES'>('DTLS');
  const [userParams, setUserParams] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sip/config');
      const cfg = response.data.config;
      setConfig(cfg);
      
      setSipEnabled(cfg.sip_enabled);
      setSrtpProtocol(cfg.srtp_key_exchange_protocol);
      
      if (cfg.sip_servers && cfg.sip_servers.length > 0) {
        const server = cfg.sip_servers[0];
        setHostname(server.hostname);
        setPort(server.port || 5061);
        
        if (server.request_uri_user_params) {
          const params = Object.entries(server.request_uri_user_params).map(([key, value]) => ({
            key,
            value: value as string,
          }));
          setUserParams(params);
        }
      }
    } catch (error: any) {
      console.error('Failed to load SIP config:', error);
      alert('Failed to load SIP configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const servers: SipServer[] = hostname
        ? [
            {
              hostname,
              port,
              request_uri_user_params: userParams.reduce((acc, param) => {
                if (param.key && param.value) {
                  acc[param.key] = param.value;
                }
                return acc;
              }, {} as { [key: string]: string }),
            },
          ]
        : [];

      const response = await api.post('/sip/config', {
        sip_enabled: sipEnabled,
        sip_servers: servers,
        srtp_key_exchange_protocol: srtpProtocol,
        calling_enabled: true,
      });

      setConfig(response.data.config);
      alert('SIP configuration saved successfully!');
      
      if (sipEnabled) {
        alert('⚠️ Warning: When SIP is enabled, Graph API calling endpoints and webhooks are disabled.');
      }
    } catch (error: any) {
      console.error('Failed to save SIP config:', error);
      alert(error.response?.data?.error || 'Failed to save SIP configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleGetPassword = async () => {
    try {
      const response = await api.get('/sip/password');
      setPassword(response.data.sip_user_password);
      setShowPassword(true);
    } catch (error: any) {
      console.error('Failed to get password:', error);
      alert(error.response?.data?.error || 'Failed to get SIP password');
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Are you sure you want to reset the SIP password? This will generate a new password.')) {
      return;
    }

    try {
      const response = await api.post('/sip/password/reset');
      setPassword(response.data.new_password);
      setShowPassword(true);
      alert('SIP password reset successfully!');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      alert(error.response?.data?.error || 'Failed to reset SIP password');
    }
  };

  const handleSync = async () => {
    try {
      await api.post('/sip/sync');
      await loadConfig();
      alert('Synced with Meta API successfully!');
    } catch (error: any) {
      console.error('Failed to sync:', error);
      alert(error.response?.data?.error || 'Failed to sync with Meta API');
    }
  };

  const addUserParam = () => {
    setUserParams([...userParams, { key: '', value: '' }]);
  };

  const removeUserParam = (index: number) => {
    setUserParams(userParams.filter((_, i) => i !== index));
  };

  const updateUserParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...userParams];
    updated[index][field] = value;
    setUserParams(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading SIP configuration...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">SIP Configuration</h1>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sync with Meta
          </button>
        </div>

        {config?.last_synced_at && (
          <div className="mb-4 text-sm text-gray-600">
            Last synced: {new Date(config.last_synced_at).toLocaleString()}
          </div>
        )}

        {/* Warning Banner */}
        {sipEnabled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-medium">
              ⚠️ Warning: When SIP is enabled, Graph API calling endpoints and webhooks are disabled.
            </p>
          </div>
        )}

        {/* Enable SIP */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={sipEnabled}
              onChange={(e) => setSipEnabled(e.target.checked)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-lg font-medium">Enable SIP</span>
          </label>
          <p className="mt-2 text-sm text-gray-600">
            Use SIP as the signaling protocol instead of Graph API endpoints
          </p>
        </div>

        {/* SIP Server Configuration */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">SIP Server</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostname *
              </label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="sip.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your SIP server hostname (must support TLS)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Default: 5061 (TLS port)
              </p>
            </div>
          </div>
        </div>

        {/* Request URI User Parameters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Request URI User Parameters</h3>
            <button
              onClick={addUserParam}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              + Add Parameter
            </button>
          </div>
          
          {userParams.length === 0 ? (
            <p className="text-sm text-gray-500">
              Optional parameters for SIP INVITE request URI (e.g., trunk groups)
            </p>
          ) : (
            <div className="space-y-2">
              {userParams.map((param, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => updateUserParam(index, 'key', e.target.value)}
                    placeholder="Key (max 128 chars)"
                    maxLength={128}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => updateUserParam(index, 'value', e.target.value)}
                    placeholder="Value (max 128 chars)"
                    maxLength={128}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeUserParam(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SRTP Protocol */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">SRTP Key Exchange Protocol</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                value="DTLS"
                checked={srtpProtocol === 'DTLS'}
                onChange={(e) => setSrtpProtocol(e.target.value as 'DTLS')}
                className="w-4 h-4 text-blue-600"
              />
              <span>DTLS (Default, Recommended)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                value="SDES"
                checked={srtpProtocol === 'SDES'}
                onChange={(e) => setSrtpProtocol(e.target.value as 'SDES')}
                className="w-4 h-4 text-blue-600"
              />
              <span>SDES (Faster call setup, plain text key in SDP)</span>
            </label>
          </div>
        </div>

        {/* SIP Credentials */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-4">SIP Credentials</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="font-medium">SIP Domain:</span>
              <span className="font-mono">wa.meta.vc</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Username:</span>
              <span className="font-mono">{process.env.WHATSAPP_PHONE_NUMBER_ID?.replace('+', '')}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleGetPassword}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Get Password
            </button>
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Reset Password
            </button>
          </div>

          {showPassword && password && (
            <div className="mt-4 p-3 bg-white border border-gray-300 rounded">
              <div className="flex justify-between items-center">
                <span className="font-medium">Password:</span>
                <span className="font-mono text-sm">{password}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Use this password for SIP digest authentication
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={loadConfig}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Documentation */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">📚 SIP Integration Notes</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>TLS transport is mandatory (port 5061)</li>
            <li>Your SIP server must present a valid TLS certificate</li>
            <li>Meta generates a unique password for each phone number + app</li>
            <li>Use digest authentication for security</li>
            <li>Test certificate: <code className="bg-white px-1">openssl s_client -verify_hostname {hostname} -connect {hostname}:{port}</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SipSettings;
