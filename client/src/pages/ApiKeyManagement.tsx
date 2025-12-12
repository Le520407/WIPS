import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Copy, Trash2, Key, Clock, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { getWebsite, getApiKeys, generateApiKey, revokeApiKey } from '../services/api';

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  rate_limit: number;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface Website {
  id: string;
  name: string;
  domain: string | null;
}

export default function ApiKeyManagement() {
  const { websiteId } = useParams<{ websiteId: string }>();
  const navigate = useNavigate();
  const [website, setWebsite] = useState<Website | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key_name: '',
    rate_limit: 1000,
    expires_at: '',
  });

  useEffect(() => {
    if (websiteId) {
      fetchData();
    }
  }, [websiteId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [websiteData, keysData] = await Promise.all([
        getWebsite(websiteId!),
        getApiKeys(websiteId!)
      ]);
      setWebsite(websiteData.website);
      setApiKeys(keysData.apiKeys || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateApiKey(websiteId!, formData);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    try {
      await revokeApiKey(keyId);
      fetchData();
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const handleCopy = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(apiKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      key_name: '',
      rate_limit: 1000,
      expires_at: '',
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/websites')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">API Key Management</h1>
          <p className="text-gray-600 mt-1">
            {website?.name} {website?.domain && `(${website.domain})`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Generate New Key
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={`bg-white rounded-lg shadow-md p-6 ${
              !apiKey.is_active ? 'opacity-60' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  apiKey.is_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Key className={`w-6 h-6 ${
                    apiKey.is_active ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{apiKey.key_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {apiKey.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        Revoked
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {apiKey.is_active && (
                <button
                  onClick={() => handleRevoke(apiKey.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke
                </button>
              )}
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">API Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg font-mono text-sm break-all">
                  {apiKey.api_key}
                </code>
                <button
                  onClick={() => handleCopy(apiKey.api_key)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedKey === apiKey.api_key ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs">Rate Limit</span>
                </div>
                <p className="text-lg font-semibold">{apiKey.rate_limit.toLocaleString()}/hour</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Last Used</span>
                </div>
                <p className="text-lg font-semibold">{getTimeAgo(apiKey.last_used_at)}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Created</span>
                </div>
                <p className="text-sm font-semibold">{formatDate(apiKey.created_at)}</p>
              </div>
            </div>

            {/* Expiration */}
            {apiKey.expires_at && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Expires:</strong> {formatDate(apiKey.expires_at)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {apiKeys.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
          <p className="text-gray-500 mb-4">Generate your first API key to start using the API</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Generate New Key
          </button>
        </div>
      )}

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Generate New API Key</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    value={formData.key_name}
                    onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                    placeholder="Production Key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit (requests/hour)
                  </label>
                  <input
                    type="number"
                    value={formData.rate_limit}
                    onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
