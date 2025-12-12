import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { groupsService } from '../services/api';

interface Group {
  id: string;
  group_id: string;
  subject: string;
  description: string | null;
  total_participant_count: number;
  suspended: boolean;
}

interface Message {
  id: string;
  message_id: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

const GroupMessages: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Message form
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (groupId) {
      loadGroupInfo();
    }
  }, [groupId]);

  const loadGroupInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await groupsService.getGroupInfo(groupId!);
      setGroup(response.group);
    } catch (err: any) {
      console.error('Failed to load group info:', err);
      setError(err.response?.data?.error || 'Failed to load group information');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!groupId) return;

    try {
      setSending(true);
      const response = await groupsService.sendGroupMessage(groupId, messageText.trim());
      
      // Add message to local state
      const newMessage: Message = {
        id: Date.now().toString(),
        message_id: response.message_id || '',
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      alert('✅ Message sent successfully!');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(`❌ Failed to send message: ${err.response?.data?.error || err.message}`);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
    };

    const icons = {
      sent: '✓',
      delivered: '✓✓',
      read: '✓✓',
      failed: '✗',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status as keyof typeof icons]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group messages...</p>
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

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Group not found</p>
          <button
            onClick={() => navigate('/groups')}
            className="mt-4 text-yellow-600 hover:text-yellow-800 font-medium"
          >
            ← Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Group Messages
            </h1>
            <p className="text-gray-600 mt-1">
              {group.subject} • {group.total_participant_count} members
            </p>
          </div>
        </div>
      </div>

      {/* Suspended Warning */}
      {group.suspended && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800 font-medium">
              ⚠️ This group is suspended. You cannot send messages.
            </p>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Message History ({messages.length})
          </h2>
        </div>

        {messages.length > 0 ? (
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900">{message.content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(message.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No messages sent yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Send your first message to the group below
            </p>
          </div>
        )}
      </div>

      {/* Send Message Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Send Message</h2>
        </div>

        <form onSubmit={handleSendMessage} className="p-6">
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message Text
            </label>
            <textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              disabled={sending || group.suspended}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={4096}
            />
            <p className="text-sm text-gray-500 mt-1">
              {messageText.length}/4096 characters
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>💡 Tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Messages are sent to all group members</li>
                <li>Maximum 4096 characters per message</li>
                <li>Check message status after sending</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={sending || !messageText.trim() || group.suspended}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📋 About Group Messages</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Messages are sent to all participants in the group</li>
          <li>• Message status shows delivery confirmation</li>
          <li>• Suspended groups cannot receive messages</li>
          <li>• Message history is stored locally in this session</li>
        </ul>
      </div>
    </div>
  );
};

export default GroupMessages;
