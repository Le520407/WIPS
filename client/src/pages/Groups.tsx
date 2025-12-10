import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Group {
  id: string;
  group_id: string;
  subject: string;
  description: string | null;
  invite_link: string | null;
  join_approval_mode: 'auto_approve' | 'approval_required';
  total_participant_count: number;
  suspended: boolean;
  creation_timestamp: string;
  created_at: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState(
    localStorage.getItem('phoneNumberId') || ''
  );
  const [newGroup, setNewGroup] = useState({
    subject: '',
    description: '',
    joinApprovalMode: 'auto_approve' as 'auto_approve' | 'approval_required',
  });

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumberId]);

  const fetchGroups = async () => {
    if (!phoneNumberId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/groups', {
        params: { phoneNumberId },
      });
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberIdChange = (value: string) => {
    setPhoneNumberId(value);
    localStorage.setItem('phoneNumberId', value);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumberId) {
      alert('Please enter your Phone Number ID first');
      return;
    }
    try {
      await api.post('/groups', {
        ...newGroup,
        phoneNumberId,
      });
      setShowCreateModal(false);
      setNewGroup({ subject: '', description: '', joinApprovalMode: 'auto_approve' });
      fetchGroups();
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.error || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await api.delete(`/groups/${groupId}`);
      fetchGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.error || 'Failed to delete group');
    }
  };

  const copyInviteLink = (link: string | null) => {
    if (!link) {
      alert('No invite link available');
      return;
    }
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Groups</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp groups</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!phoneNumberId}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Create Group
        </button>
      </div>

      {/* Phone Number ID Input */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Phone Number ID *
        </label>
        <input
          type="text"
          value={phoneNumberId}
          onChange={(e) => handlePhoneNumberIdChange(e.target.value)}
          onBlur={fetchGroups}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter your WhatsApp Phone Number ID (e.g., 123456789012345)"
        />
        <p className="text-xs text-gray-600 mt-2">
          💡 Find this in your WhatsApp Business Account settings or .env file (WHATSAPP_PHONE_NUMBER_ID)
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No groups yet. Create your first group!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{group.subject}</h3>
                  {group.description && (
                    <p className="text-gray-600 mt-1">{group.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>👥 {group.total_participant_count} members</span>
                    <span>
                      {group.join_approval_mode === 'approval_required' ? '🔒 Approval Required' : '✅ Auto Approve'}
                    </span>
                    {group.suspended && <span className="text-red-600">⚠️ Suspended</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {group.invite_link && (
                    <button
                      onClick={() => copyInviteLink(group.invite_link)}
                      className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded border border-blue-600"
                    >
                      Copy Link
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteGroup(group.group_id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {group.invite_link && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600">Invite Link: </span>
                  <span className="text-blue-600 break-all">{group.invite_link}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Subject *
                </label>
                <input
                  type="text"
                  value={newGroup.subject}
                  onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter group subject"
                  maxLength={128}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Max 128 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter group description (optional)"
                  rows={3}
                  maxLength={2048}
                />
                <p className="text-xs text-gray-500 mt-1">Max 2048 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Approval Mode
                </label>
                <select
                  value={newGroup.joinApprovalMode}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      joinApprovalMode: e.target.value as 'auto_approve' | 'approval_required',
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="auto_approve">Auto Approve - Users join instantly</option>
                  <option value="approval_required">Approval Required - Manual approval needed</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium">📌 Note:</p>
                <p className="mt-1">The invite link will be received via webhook after group creation.</p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
