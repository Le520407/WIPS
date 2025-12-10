import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Phone, MessageSquare, Check, X, RefreshCw } from 'lucide-react';

interface MissedCall {
  id: number;
  call_id: string;
  from_number: string;
  to_number: string;
  status: string;
  start_time: string;
  callback_sent: boolean;
  callback_completed: boolean;
  created_at: string;
}

interface GroupedCalls {
  [phone: string]: MissedCall[];
}

const MissedCalls: React.FC = () => {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [groupedCalls, setGroupedCalls] = useState<GroupedCalls>({});
  const [statistics, setStatistics] = useState({
    total_missed: 0,
    unique_contacts: 0,
    needs_callback: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedCalls, setSelectedCalls] = useState<number[]>([]);
  const [messageModal, setMessageModal] = useState<{ show: boolean; callId: number | null; phone: string }>({
    show: false,
    callId: null,
    phone: '',
  });
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchMissedCalls();
  }, [showUnreadOnly]);

  const fetchMissedCalls = async () => {
    try {
      setLoading(true);
      const params = showUnreadOnly ? { unread_only: 'true' } : {};
      const response = await api.get('/missed-calls', { params });
      setMissedCalls(response.data.missed_calls || []);
      setGroupedCalls(response.data.grouped_by_phone || {});
      setStatistics(response.data.statistics || {
        total_missed: 0,
        unique_contacts: 0,
        needs_callback: 0,
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load missed calls');
      console.error('Error fetching missed calls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallback = async (callId: number, phone: string) => {
    if (!confirm(`Initiate callback to ${phone}?`)) return;

    try {
      await api.post(`/missed-calls/${callId}/callback`);
      alert('Callback initiated successfully!');
      fetchMissedCalls();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate callback');
    }
  };

  const handleSendMessage = async () => {
    if (!messageModal.callId || !messageText.trim()) return;

    try {
      await api.post(`/missed-calls/${messageModal.callId}/message`, {
        message: messageText
      });
      alert('Message sent successfully!');
      setMessageModal({ show: false, callId: null, phone: '' });
      setMessageText('');
      fetchMissedCalls();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleMarkAsHandled = async (callId: number) => {
    try {
      await api.post(`/missed-calls/${callId}/mark-handled`);
      fetchMissedCalls();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark as handled');
    }
  };

  const handleBulkMarkAsHandled = async () => {
    if (selectedCalls.length === 0) {
      alert('Please select calls to mark as handled');
      return;
    }

    try {
      await api.post('/missed-calls/bulk/mark-handled', {
        call_ids: selectedCalls
      });
      setSelectedCalls([]);
      fetchMissedCalls();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to bulk mark as handled');
    }
  };

  const toggleSelectCall = (callId: number) => {
    setSelectedCalls(prev =>
      prev.includes(callId)
        ? prev.filter(id => id !== callId)
        : [...prev, callId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCalls.length === missedCalls.length) {
      setSelectedCalls([]);
    } else {
      setSelectedCalls(missedCalls.map(call => call.id));
    }
  };

  const openMessageModal = (callId: number, phone: string) => {
    setMessageModal({ show: true, callId, phone });
    setMessageText(`Hi, I noticed you tried to call me. How can I help you?`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading missed calls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMissedCalls}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missed Calls</h1>
          <p className="text-gray-600 mt-1">Manage and respond to missed calls</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-4 py-2 rounded-lg ${
              showUnreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
          <button
            onClick={fetchMissedCalls}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Missed</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {statistics.total_missed}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Unique Contacts</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {statistics.unique_contacts}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Needs Callback</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {statistics.needs_callback}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCalls.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-blue-900">
            {selectedCalls.length} call(s) selected
          </div>
          <button
            onClick={handleBulkMarkAsHandled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark All as Handled
          </button>
        </div>
      )}

      {/* Missed Calls List */}
      {missedCalls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-lg">No missed calls</div>
          <p className="text-gray-500 mt-2">
            {showUnreadOnly
              ? 'All missed calls have been handled'
              : 'You have no missed calls'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedCalls.length === missedCalls.length}
              onChange={toggleSelectAll}
              className="w-4 h-4"
            />
            <div className="flex-1 grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase">
              <div>From</div>
              <div>Status</div>
              <div>Time</div>
              <div>Callback Status</div>
              <div>Handled</div>
              <div className="text-right">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {missedCalls.map((call) => (
              <div
                key={call.id}
                className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 ${
                  call.callback_completed ? 'opacity-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCalls.includes(call.id)}
                  onChange={() => toggleSelectCall(call.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                  <div className="font-medium text-gray-900">{call.from_number}</div>
                  <div>
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                      {call.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(call.created_at).toLocaleString()}
                  </div>
                  <div>
                    {call.callback_sent ? (
                      <span className="text-xs text-green-600">✓ Sent</span>
                    ) : (
                      <span className="text-xs text-gray-400">Not sent</span>
                    )}
                  </div>
                  <div>
                    {call.callback_completed ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Handled
                      </span>
                    ) : (
                      <span className="text-xs text-orange-600">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {!call.callback_completed && (
                      <>
                        <button
                          onClick={() => handleCallback(call.id, call.from_number)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Call back"
                          disabled={call.callback_sent}
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openMessageModal(call.id, call.from_number)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Send message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkAsHandled(call.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          title="Mark as handled"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped View */}
      {Object.keys(groupedCalls).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grouped by Contact</h2>
          <div className="space-y-4">
            {Object.entries(groupedCalls).map(([phone, calls]) => (
              <div key={phone} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{phone}</div>
                  <div className="text-sm text-gray-600">
                    {calls.length} missed call{calls.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Last call: {new Date(calls[0].created_at).toLocaleString()}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleCallback(calls[0].id, phone)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    disabled={calls[0].callback_sent}
                  >
                    <Phone className="w-3 h-3" />
                    Call Back
                  </button>
                  <button
                    onClick={() => openMessageModal(calls[0].id, phone)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send Message to {messageModal.phone}
            </h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none"
              placeholder="Type your message..."
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMessageModal({ show: false, callId: null, phone: '' });
                  setMessageText('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissedCalls;
