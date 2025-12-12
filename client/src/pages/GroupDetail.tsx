import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsService } from '../services/api';
import { ArrowLeft, Users, Link as LinkIcon, Settings, Trash2, RefreshCw, Copy, UserMinus, UserPlus, MessageSquare } from 'lucide-react';

interface GroupInfo {
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

interface Participant {
  phone_number: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'participants' | 'settings'>('info');
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: '',
    description: '',
  });
  
  // Remove participant state
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (groupId) {
      fetchGroupInfo();
    }
  }, [groupId]);

  const fetchGroupInfo = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      const response = await groupsService.getGroupInfo(groupId);
      setGroup(response.group);
      setParticipants(response.participants || []);
      setEditForm({
        subject: response.group.subject,
        description: response.group.description || '',
      });
    } catch (error: any) {
      console.error('Error fetching group info:', error);
      alert(error.response?.data?.error || 'Failed to fetch group info');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!group?.invite_link) {
      alert('No invite link available');
      return;
    }
    navigator.clipboard.writeText(group.invite_link);
    alert('Invite link copied to clipboard!');
  };

  const handleResetInviteLink = async () => {
    if (!groupId) return;
    if (!confirm('Are you sure you want to reset the invite link? The old link will no longer work.')) return;
    
    try {
      const response = await groupsService.resetInviteLink(groupId);
      alert('Invite link reset successfully!');
      setGroup(prev => prev ? { ...prev, invite_link: response.invite_link } : null);
    } catch (error: any) {
      console.error('Error resetting invite link:', error);
      alert(error.response?.data?.error || 'Failed to reset invite link');
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    
    try {
      await groupsService.updateGroup(groupId, {
        subject: editForm.subject,
        description: editForm.description || undefined,
      });
      alert('Group updated successfully!');
      setIsEditing(false);
      fetchGroupInfo();
    } catch (error: any) {
      console.error('Error updating group:', error);
      alert(error.response?.data?.error || 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    try {
      await groupsService.deleteGroup(groupId);
      alert('Group deleted successfully!');
      navigate('/groups');
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.error || 'Failed to delete group');
    }
  };

  const handleRemoveParticipants = async () => {
    if (!groupId || selectedParticipants.length === 0) return;
    if (!confirm(`Remove ${selectedParticipants.length} participant(s) from the group?`)) return;
    
    try {
      await groupsService.removeParticipants(groupId, selectedParticipants);
      alert('Participants removed successfully!');
      setSelectedParticipants([]);
      fetchGroupInfo();
    } catch (error: any) {
      console.error('Error removing participants:', error);
      alert(error.response?.data?.error || 'Failed to remove participants');
    }
  };

  const toggleParticipantSelection = (phoneNumber: string) => {
    setSelectedParticipants(prev =>
      prev.includes(phoneNumber)
        ? prev.filter(p => p !== phoneNumber)
        : [...prev, phoneNumber]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading group details...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Group not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.subject}</h1>
            <p className="text-gray-600 mt-1">
              {group.total_participant_count} members • Created {new Date(group.creation_timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/groups/${groupId}/messages`)}
            className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
          >
            <MessageSquare className="w-4 h-4" />
            Messages
          </button>
          <button
            onClick={() => navigate(`/groups/${groupId}/join-requests`)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            <UserPlus className="w-4 h-4" />
            Join Requests
          </button>
          <button
            onClick={handleDeleteGroup}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Group
          </button>
        </div>
      </div>

      {/* Status Badges */}
      {group.suspended && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">⚠️ This group is suspended</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Info & Invite Link
            </div>
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'participants'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Group Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="text-gray-900 mt-1">{group.subject}</p>
                </div>
                {group.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{group.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Join Approval Mode</label>
                  <p className="text-gray-900 mt-1">
                    {group.join_approval_mode === 'approval_required' ? '🔒 Approval Required' : '✅ Auto Approve'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Group ID</label>
                  <p className="text-gray-600 mt-1 font-mono text-sm">{group.group_id}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Invite Link</h3>
              {group.invite_link ? (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Share this link to invite people:</p>
                    <p className="text-blue-600 break-all font-mono text-sm">{group.invite_link}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyInviteLink}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={handleResetInviteLink}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    📌 Invite link will be received via webhook after group creation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Participants ({participants.length})</h3>
              {selectedParticipants.length > 0 && (
                <button
                  onClick={handleRemoveParticipants}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove ({selectedParticipants.length})
                </button>
              )}
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No participants yet
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.phone_number}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.phone_number)}
                        onChange={() => toggleParticipantSelection(participant.phone_number)}
                        disabled={participant.role === 'admin'}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-gray-900">+{participant.phone_number}</p>
                        <p className="text-sm text-gray-500">
                          Joined {new Date(participant.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      participant.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.role === 'admin' ? '👑 Admin' : 'Member'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Note:</strong> You cannot remove admin participants. Maximum 8 participants per group.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Group Settings</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit Settings
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Subject *
                  </label>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
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
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter group description (optional)"
                    rows={3}
                    maxLength={2048}
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 2048 characters</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        subject: group.subject,
                        description: group.description || '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="text-gray-900 mt-1">{group.subject}</p>
                </div>
                {group.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{group.description}</p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Danger Zone</h4>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-800 mb-3">
                  Once you delete a group, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteGroup}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete This Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
