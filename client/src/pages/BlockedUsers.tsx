import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface BlockedUser {
  id: string;
  blockedPhoneNumber: string;
  waId: string;
  reason?: string;
  blockedAt: string;
}

const BlockedUsers: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneNumberToBlock, setPhoneNumberToBlock] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const phoneNumberId = '803320889535856';

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/block-users/${phoneNumberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlockedUsers(response.data.data || []);
    } catch (err: any) {
      console.error('Error loading blocked users:', err);
      setError(err.response?.data?.error || 'Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumberToBlock.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/block-users/${phoneNumberId}/block`,
        {
          users: [phoneNumberToBlock],
          reason: reason || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(response.data.message);
      setPhoneNumberToBlock('');
      setReason('');
      await loadBlockedUsers();
    } catch (err: any) {
      console.error('Error blocking user:', err);
      setError(err.response?.data?.error?.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (phoneNumber: string) => {
    if (!confirm(`Are you sure you want to unblock ${phoneNumber}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/block-users/${phoneNumberId}/unblock`,
        {
          users: [phoneNumber],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(response.data.message);
      await loadBlockedUsers();
    } catch (err: any) {
      console.error('Error unblocking user:', err);
      setError(err.response?.data?.error?.message || 'Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/block-users/${phoneNumberId}/sync`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(response.data.message);
      await loadBlockedUsers();
    } catch (err: any) {
      console.error('Error syncing blocked users:', err);
      setError(err.response?.data?.error || 'Failed to sync blocked users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blocked Users</h1>
        <p className="text-gray-600 mt-2">
          Manage your blocked users list. Block bad actors from contacting your business.
        </p>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Block User Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Block a User</h2>
        <form onSubmit={handleBlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number or WhatsApp ID
            </label>
            <input
              type="text"
              value={phoneNumberToBlock}
              onChange={(e) => setPhoneNumberToBlock(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Note: You can only block users who have messaged you in the last 24 hours
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you blocking this user?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !phoneNumberToBlock.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Blocking...' : 'Block User'}
          </button>
        </form>
      </div>

      {/* Blocked Users List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Blocked Users List</h2>
          <button
            onClick={handleSync}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? 'Syncing...' : 'Sync from Meta'}
          </button>
        </div>

        {loading && blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blocked users. Block users who spam or harass your business.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    WhatsApp ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Blocked At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {blockedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.blockedPhoneNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.waId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.blockedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleUnblock(user.blockedPhoneNumber)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>Total blocked users: {blockedUsers.length} / 64,000 (limit)</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>You can only block users who have messaged you in the last 24 hours</li>
          <li>Maximum blocklist limit: 64,000 users</li>
          <li>Blocked users cannot contact you or see that you're online</li>
          <li>You cannot message blocked users</li>
          <li>You cannot block other WhatsApp Business accounts</li>
        </ul>
      </div>
    </div>
  );
};

export default BlockedUsers;
