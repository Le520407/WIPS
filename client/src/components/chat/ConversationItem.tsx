import React from 'react';

interface ConversationItemProps {
  conversation: any;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  const getInitials = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.slice(-4).substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-whatsapp-green shadow-sm' 
          : 'hover:bg-gray-50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-whatsapp-green to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            {getInitials(conversation.phoneNumber)}
          </div>
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-xs font-bold text-white">{conversation.unreadCount}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <p className={`font-semibold truncate text-base ${
              conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-800'
            }`}>
              {conversation.phoneNumber}
            </p>
            <span className={`text-xs ml-2 flex-shrink-0 font-medium ${
              conversation.unreadCount > 0 ? 'text-whatsapp-green' : 'text-gray-500'
            }`}>
              {formatTime(conversation.lastMessageTime)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <p className={`text-sm truncate ${
              conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
            }`}>
              {conversation.lastMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
