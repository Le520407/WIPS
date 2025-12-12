import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, X, Check, Users, Clock, AlertCircle } from 'lucide-react';
import { groupsService } from '../services/api';

interface JoinRequest {
  id: string;
  group_id: string;
  wa_id: string;
  join_request_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  request_time: string;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;
  group_id: string;
  subject: string;
  description: string | null;
  total_participant_count: number;
  suspended: boolean;
}

const GroupJoinRequests: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load group info
      const groupResponse = await groupsService.getGroupInfo(groupId!);
      setGroup(groupResponse.data.group);

      // Load join requests
      const requestsResponse = await groupsService.getJoinRequests(groupId!);
      setRequests(requestsResponse.data.requests || []);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.error || 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (requestId: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleSelectAll = () => {
    const pendingRequests = requests.filter(r => r.status === 'pending');
    if (selectedRequests.size === pendingRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(pendingRequests.map(r => r.wa_id)));
    }
  };

  const handleApprove = async (waIds: string[]) => {
    try {
      setProcessing(true);
      await groupsService.approveJoinRequests(groupId!, waIds);
      
      // Refresh data
      await loadData();
      setSelectedRequests(new Set());
      
      alert(`✅ Successfully approved ${waIds.length} request(s)`);
    } catch (err: any) {
      console.error('Failed to approve requests:', err);
      alert(`❌ Failed to approve: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (waIds: string[]) => {
    try {
      setProcessing(true);
      await groupsService.rejectJoinRequests(groupId!, waIds);
      
      // Refresh data
      await loadData();
      setSelectedRequests(new Set());
      
      alert(`✅ Successfully rejected ${waIds.length} request(s)`);
    } catch (err: any) {
      console.error('Failed to reject requests:', err);
      alert(`❌ Failed to reject: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchApprove = () => {
    if (selectedRequests.size === 0) {
      alert('Please select at least one request');
      return;
    }

    if (confirm(`Approve ${selectedRequests.size} selected request(s)?`)) {
      handleApprove(Array.from(selectedRequests));
    }
  };

  const handleBatchReject = () => {
    if (selectedRequests.size === 0) {
      alert('Please select at least one request');
      return;
    }

    if (confirm(`Reject ${selectedRequests.size} selected request(s)?`)) {
      handleReject(Array.from(selectedRequests));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading join requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="mt-4 text-red-600 hover:text-red-800 font-medium"
          >
            ← Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/groups/${groupId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Group Detail
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Join Requests</h1>
            {group && (
              <p className="text-gray-600 mt-1">
                {group.subject} • {pendingRequests.length} pending
              </p>
            )}
          </div>

          {pendingRequests.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {selectedRequests.size === pendingRequests.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedRequests.size > 0 && (
                <>
                  <button
                    onClick={handleBatchApprove}
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve ({selectedRequests.size})
                  </button>
                  
                  <button
                    onClick={handleBatchReject}
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject ({selectedRequests.size})
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 ? (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pending Requests ({pendingRequests.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedRequests.has(request.wa_id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedRequests.has(request.wa_id)}
                      onChange={() => handleSelectRequest(request.wa_id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-gray-600" />
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">{request.wa_id}</p>
                          <p className="text-sm text-gray-500">
                            Requested: {formatDate(request.request_time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(request.status)}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove([request.wa_id])}
                      disabled={processing}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleReject([request.wa_id])}
                      disabled={processing}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center mb-6">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">
            There are no pending join requests for this group.
          </p>
        </div>
      )}

      {/* Processed Requests History */}
      {processedRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Request History ({processedRequests.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {processedRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{request.wa_id}</p>
                      <p className="text-sm text-gray-500">
                        Requested: {formatDate(request.request_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(request.status)}
                    <p className="text-sm text-gray-500">
                      {formatDate(request.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupJoinRequests;
