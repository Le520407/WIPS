import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { VoiceMessage } from '../VoiceMessage';

interface ChatBubbleProps {
  message: any;
  isSent: boolean;
  isGrouped?: boolean;
  showTimestamp?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSent,
  isGrouped = false,
  showTimestamp = true
}) => {

  const renderStatusIcon = () => {
    if (!isSent) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="text-sm break-words whitespace-pre-wrap text-gray-900 dark:text-white">{message.content}</p>;
      
      case 'image':
        return (
          <div>
            {message.mediaUrl && (
              <img 
                src={message.mediaUrl} 
                alt="Shared" 
                className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            )}
            {message.caption && <p className="text-sm mt-2 text-gray-900 dark:text-white">{message.caption}</p>}
          </div>
        );
      
      case 'video':
        return (
          <div>
            {message.mediaUrl && (
              <video src={message.mediaUrl} controls className="max-w-sm rounded-lg" />
            )}
            {message.caption && <p className="text-sm mt-2 text-gray-900 dark:text-white">{message.caption}</p>}
          </div>
        );
      
      case 'audio':
      case 'voice':
        return (
          <VoiceMessage
            mediaUrl={message.mediaUrl}
            mediaId={message.mediaId}
            isSent={isSent}
          />
        );
      
      case 'document':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 bg-opacity-50 rounded-lg">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{message.caption || 'Document'}</p>
              <p className="text-xs text-gray-900 dark:text-white">Click to download</p>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="font-medium text-sm text-gray-900 dark:text-white">Location</span>
            </div>
            {message.content && <p className="text-sm text-gray-900 dark:text-white">{message.content}</p>}
          </div>
        );
      
      case 'contacts':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 bg-opacity-50 rounded-lg">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{message.content}</p>
              <p className="text-xs text-gray-900 dark:text-white">Contact</p>
            </div>
          </div>
        );
      
      case 'sticker':
        return (
          <div className="flex justify-center">
            {message.mediaUrl && (
              <img src={message.mediaUrl} alt="Sticker" className="w-32 h-32 object-contain" />
            )}
          </div>
        );
      
      case 'interactive':
        return (
          <div>
            <p className="text-sm mb-2 text-gray-900 dark:text-white">{message.content}</p>
            <div className="text-xs text-gray-900 dark:text-white">Interactive message</div>
          </div>
        );
      
      case 'reaction':
        // Extract emoji and content from message
        // Old format: content = "Reacted with 😮", reactionEmoji = null
        // New format: content = "original message", reactionEmoji = "😮"
        let emoji = message.reactionEmoji;
        let originalContent = null;
        
        // Handle old format: extract emoji from "Reacted with X"
        if (!emoji && message.content) {
          // Match "Reacted with [emoji]" pattern
          const match = message.content.match(/^Reacted with (.+)$/);
          if (match) {
            emoji = match[1].trim();
          }
        }
        
        // Check if there's original message content (contextMessageContent)
        if (message.contextMessageContent) {
          originalContent = message.contextMessageContent;
        }
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji || '👍'}</span>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Reacted</span>
                {originalContent && (
                  <span> to: "{originalContent}"</span>
                )}
              </p>
            </div>
          </div>
        );
      
      default:
        return <p className="text-sm text-gray-900 dark:text-white">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-3'}`}>
      <div className="relative">
        <div
          className={`max-w-md rounded-lg px-3 py-2 transition-all duration-200 ${
            isSent 
              ? 'bg-gradient-to-br from-[#DCF8C6] to-[#D1F4C0] text-gray-900 shadow-md hover:shadow-lg' 
              : 'bg-white text-gray-900 shadow-md hover:shadow-lg'
          }`}
          style={{
            borderRadius: isSent ? '12px 12px 2px 12px' : '12px 12px 12px 2px'
          }}
        >
          {message.contextMessageContent && (
            <div className="bg-gray-100 dark:bg-gray-800 bg-opacity-50 border-l-4 border-green-500 dark:border-green-400 pl-2 py-1 mb-2 rounded">
              <p className="text-xs text-gray-900 dark:text-white font-medium">
                {message.contextMessageType === 'text' ? 'Replying to:' : 'Replying to media'}
              </p>
              <p className="text-xs text-gray-900 dark:text-white truncate">{message.contextMessageContent}</p>
            </div>
          )}

          {renderMessageContent()}

          {showTimestamp && (
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-xs text-gray-900 dark:text-white">{formatTime(message.timestamp)}</span>
              {renderStatusIcon()}
            </div>
          )}
        </div>

        {/* Reaction Badge */}
        {message.reactionEmoji && message.type !== 'reaction' && (
          <div 
            className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 shadow-lg border-2 border-gray-100 flex items-center gap-1 z-10"
            title={`Reacted with ${message.reactionEmoji}`}
          >
            <span className="text-base leading-none">{message.reactionEmoji}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
