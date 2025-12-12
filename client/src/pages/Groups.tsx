import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsService } from '../services/api';
import CreateGroupModal from '../components/CreateGroupModal';

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
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState(
    localStorage.getItem('phoneNumberId') || ''
  );

  const fetchGroups = useCallback(async () => {
    const currentPhoneNumberId = localStorage.getItem('phoneNumberId') || '';
    if (!currentPhoneNumberId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await groupsService.getGroups(currentPhoneNumberId);
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handlePhoneNumberIdChange = (value: string) => {
    setPhoneNumberId(value);
    localStorage.setItem('phoneNumberId', value);
  };

  const handleCreateGroup = useCallback(async (
    subject: string,
    description: string,
    _joinApprovalMode: 'auto_approve' | 'approval_required'
  ) => {
    try {
      const currentPhoneNumberId = localStorage.getItem('phoneNumberId') || phoneNumberId;
      await groupsService.createGroup(
        subject,
        description || undefined,
        currentPhoneNumberId
      );
      alert('Group created successfully! The invite link will be received via webhook.');
      fetchGroups();
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.error || 'Failed to create group');
      throw error; // Re-throw to let modal handle it
    }
  }, [fetchGroups, phoneNumberId]);

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await groupsService.deleteGroup(groupId);
      alert('Group deleted successfully!');
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              fetchGroups();
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div key={group.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/groups/${group.group_id}`)}
                >
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

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        phoneNumberId={phoneNumberId}
      />
    </div>
  );
}
