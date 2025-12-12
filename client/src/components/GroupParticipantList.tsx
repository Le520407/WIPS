import React, { useState } from 'react';
import { Users, UserMinus, Shield, AlertCircle } from 'lucide-react';

interface Participant {
  wa_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

interface GroupParticipantListProps {
  participants: Participant[];
  currentUserWaId?: string;
  canRemove?: boolean;
  onRemove?: (waId: string) => void;
  loading?: boolean;
}

const GroupParticipantList: React.FC<GroupParticipantListProps> = ({
  participants,
  currentUserWaId,
  canRemove = false,
  onRemove,
  loading = false,
}) => {
  const [removingWaId, setRemovingWaId] = useState<string | null>(null);

  const handleRemove = async (waId: string) => {
    if (!onRemove) return;

    if (!confirm(`Remove participant ${waId} from the group?`)) {
      return;
    }

    try {
      setRemovingWaId(waId);
      await onRemove(waId);
    } finally {
      setRemovingWaId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium flex items-center">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
        Member
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No participants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const isCurrentUser = participant.wa_id === currentUserWaId;
        const isRemoving = removingWaId === participant.wa_id;
        const canRemoveThis = canRemove && !isCurrentUser && participant.role !== 'admin';

        return (
          <div
            key={participant.wa_id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {participant.wa_id}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </p>
                  {getRoleBadge(participant.role)}
                </div>
                <p className="text-sm text-gray-500">
                  Joined: {formatDate(participant.joined_at)}
                </p>
              </div>
            </div>

            {canRemoveThis && (
              <button
                onClick={() => handleRemove(participant.wa_id)}
                disabled={isRemoving}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove participant"
              >
                {isRemoving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                ) : (
                  <UserMinus className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        );
      })}

      {canRemove && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium mb-1">Participant Removal Notes:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>You cannot remove yourself from the group</li>
                <li>Admins cannot be removed</li>
                <li>Removed participants can rejoin via invite link</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupParticipantList;
