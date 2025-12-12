import React from 'react';
import { Users, Link as LinkIcon, AlertCircle, ChevronRight } from 'lucide-react';

interface GroupCardProps {
  group: {
    id: string;
    group_id: string;
    subject: string;
    description: string | null;
    total_participant_count: number;
    suspended: boolean;
    creation_timestamp: string;
  };
  onClick?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              {group.subject}
              {group.suspended && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                  Suspended
                </span>
              )}
            </h3>
            {group.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{group.total_participant_count} members</span>
          </div>
          <div className="flex items-center">
            <LinkIcon className="w-4 h-4 mr-1" />
            <span>Created {formatDate(group.creation_timestamp)}</span>
          </div>
        </div>

        {/* Group ID */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-mono truncate">
            ID: {group.group_id}
          </p>
        </div>

        {/* Suspended Warning */}
        {group.suspended && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
            <p className="text-xs text-red-800">
              This group is suspended and cannot receive messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
