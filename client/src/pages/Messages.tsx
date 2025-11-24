import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { messageService } from '../services/api';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    messageService.getConversations()
      .then((data: any) => setConversations(data.conversations))
      .catch((err: any) => console.error(err));
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !recipient) return;

    try {
      await messageService.sendMessage(recipient, newMessage);
      setNewMessage('');
      alert('消息发送成功！');
    } catch (error) {
      alert('发送失败');
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">对话列表</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">暂无对话</p>
          ) : (
            conversations.map((conv: any) => (
              <div
                key={conv.id}
                className="p-4 border-b hover:bg-gray-50 cursor-pointer"
              >
                <p className="font-medium">{conv.phoneNumber}</p>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b">
          <h2 className="text-xl font-semibold">消息</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">选择对话或发送新消息</p>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className="mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p>{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t">
          <div className="mb-2">
            <input
              type="text"
              placeholder="收件人号码 (例如: 8613800138000)"
              value={recipient}
              onChange={(e: any) => setRecipient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入消息..."
              value={newMessage}
              onChange={(e: any) => setNewMessage(e.target.value)}
              onKeyPress={(e: any) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
