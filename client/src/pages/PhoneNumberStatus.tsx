import { useState, useEffect } from 'react';
import api from '../services/api';

interface PhoneNumberStatus {
  phone_number: string;
  display_phone_number: string;
  quality_rating: string;
  status: string;
  throughput: {
    level: string;
    limit?: number;
  };
  verified_name?: string;
  code_verification_status?: string;
  messaging_limit_tier?: string;
  name_status?: string;
  quality_info: {
    color: string;
    label: string;
    description: string;
  };
  status_info: {
    color: string;
    label: string;
    description: string;
  };
  throughput_info: {
    color: string;
    label: string;
    description: string;
    limit?: number;
  };
}

export default function PhoneNumberStatus() {
  const [status, setStatus] = useState<PhoneNumberStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/phone-number/status');
      setStatus(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch phone number status');
      console.error('Fetch status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-300';
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Phone Number Status</h1>
        <p className="text-gray-600 mt-1">View the health status and limits of your WhatsApp Business phone number</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Phone Number ID</p>
            <p className="text-lg font-mono text-gray-900">{status.phone_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Display Phone Number</p>
            <p className="text-lg font-semibold text-gray-900">{status.display_phone_number}</p>
          </div>
          {status.verified_name && (
            <div>
              <p className="text-sm text-gray-600">Verified Name</p>
              <p className="text-lg text-gray-900">{status.verified_name}</p>
            </div>
          )}
          {status.messaging_limit_tier && (
            <div>
              <p className="text-sm text-gray-600">Messaging Limit Tier</p>
              <p className="text-lg text-gray-900">{status.messaging_limit_tier}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Quality Rating */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Quality Rating</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getColorClass(status.quality_info.color)}`}>
              {status.quality_info.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">{status.quality_rating}</p>
          <p className="text-sm text-gray-600">{status.quality_info.description}</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Connection Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getColorClass(status.status_info.color)}`}>
              {status.status_info.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">{status.status}</p>
          <p className="text-sm text-gray-600">{status.status_info.description}</p>
        </div>

        {/* Throughput */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Throughput Level</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getColorClass(status.throughput_info.color)}`}>
              {status.throughput_info.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">{status.throughput.level}</p>
          <p className="text-sm text-gray-600">{status.throughput_info.description}</p>
          {status.throughput_info.limit && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Messages Per Second Limit</p>
              <p className="text-lg font-semibold text-gray-900">{status.throughput_info.limit} msg/s</p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>

      {/* Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📊 About These Metrics</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Quality Rating</strong>: Score based on user feedback and message quality</li>
          <li><strong>Connection Status</strong>: Current connection status of the phone number</li>
          <li><strong>Throughput</strong>: Maximum number of messages that can be sent per second</li>
        </ul>
      </div>
    </div>
  );
}
