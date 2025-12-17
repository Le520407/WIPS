import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  conversation: any;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  conversation,
  onBack 
}) => {
  const getInitials = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.slice(-4).substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-gradient-to-r from-[#EDEDED] to-gray-100 border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-white/50 rounded-full transition-all duration-200 hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-whatsapp-green to-emerald-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
            {getInitials(conversation.phoneNumber)}
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">{conversation.phoneNumber}</p>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-white/60 rounded-full transition-all duration-200 hover:shadow-md group">
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-whatsapp-green transition-colors" />
          </button>
          <button className="p-2.5 hover:bg-white/60 rounded-full transition-all duration-200 hover:shadow-md group">
            <Video className="w-5 h-5 text-gray-600 group-hover:text-whatsapp-green transition-colors" />
          </button>
          <button className="p-2.5 hover:bg-white/60 rounded-full transition-all duration-200 hover:shadow-md group">
            <MoreVertical className="w-5 h-5 text-gray-600 group-hover:text-whatsapp-green transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
