import React from 'react';
import { UserPlus, Check, X } from 'lucide-react';

interface JoinRequestCardProps {
  request: {
    id: string;
    wa_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'revoked';
    request_time: string;
    updated_at?: string;
  };
  selected?: boolean;
  onSelect?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  processing?: boolean;
  showActions?: boolean;
}

const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
  request,
  selected = false,
  onSelect,
  onApprove,
  onReject,
  processing = false,
  showActions = true,
}) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isPending = request.status === 'pending';

  return (
    <div
      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
        selected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {isPending && onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}

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
                {request.updated_at && request.status !== 'pending' && (
                  <p className="text-xs text-gray-400">
                    Updated: {formatDate(request.updated_at)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {getStatusBadge(request.status)}
        </div>

        {showActions && isPending && onApprove && onReject && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onApprove}
              disabled={processing}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              title="Approve"
            >
              <Check className="w-5 h-5" />
            </button>
            
            <button
              onClick={onReject}
              disabled={processing}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Reject"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestCard;
