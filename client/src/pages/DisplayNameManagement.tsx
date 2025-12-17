import { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';

interface DisplayNameStatus {
  display_phone_number: string;
  verified_name?: string;
  name_status?: string;
  quality_rating?: string;
  name_status_info?: {
    color: string;
    label: string;
    description: string;
  };
}

export default function DisplayNameManagement() {
  const [status, setStatus] = useState<DisplayNameStatus | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/business-profile/display-name/status');
      setStatus(response.data.data);
      if (response.data.data.verified_name) {
        setDisplayName(response.data.data.verified_name);
      }
    } catch (err: any) {
      console.error('Fetch status error:', err);
      setMessage({ type: 'error', text: 'Failed to fetch display name status' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!displayName || displayName.length < 3 || displayName.length > 100) {
      setMessage({ type: 'error', text: 'Display name must be between 3-100 characters' });
      return;
    }

    try {
      setUpdating(true);
      setMessage(null);
      await api.post('/business-profile/display-name', { display_name: displayName });
      setMessage({ type: 'success', text: 'Display name update request submitted, awaiting Meta review' });
      // Refresh status after a delay
      setTimeout(fetchStatus, 2000);
    } catch (err: any) {
      console.error('Update error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to update display name' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED':
      case 'AVAILABLE_WITHOUT_REVIEW':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING_REVIEW':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'DECLINED':
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Display Name Management</h1>
        <p className="text-gray-600 mt-1">Manage your WhatsApp Business display name</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Status */}
      {status && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Display Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">{status.display_phone_number}</p>
              </div>
              {status.quality_rating && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Quality Rating</p>
                  <p className="text-lg font-semibold text-gray-900">{status.quality_rating}</p>
                </div>
              )}
            </div>

            {status.verified_name && (
              <div>
                <p className="text-sm text-gray-600">Current Verified Name</p>
                <p className="text-lg font-semibold text-gray-900">{status.verified_name}</p>
              </div>
            )}

            {status.name_status && status.name_status_info && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.name_status)}
                  <div>
                    <p className="text-sm text-gray-600">Name Status</p>
                    <p className="text-sm text-gray-900">{status.name_status_info.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status.name_status_info.color)}`}>
                  {status.name_status_info.label}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Display Name */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Display Name</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new display name"
              minLength={3}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              3-100 characters, will be submitted to Meta for review
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              disabled={updating || !displayName}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {updating ? 'Submitting...' : 'Submit Update'}
            </button>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </button>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 About Display Name</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Display name appears in users' WhatsApp chat list</li>
          <li>• Changing display name requires Meta review, typically takes 1-3 business days</li>
          <li>• New name will automatically take effect after approval</li>
          <li>• Recommended to use your brand or company name</li>
        </ul>
      </div>
    </div>
  );
}
