import { useNavigate } from 'react-router-dom';
import { Home, Book, MessageSquare, FileText } from 'lucide-react';

const DemoInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎭 Demo Mode</h1>
            <p className="text-xl text-gray-600">Test all features without configuration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Enabled Features</h3>
              <ul className="space-y-2 text-green-700">
                <li>• One-click login (no Facebook)</li>
                <li>• View statistics</li>
                <li>• Browse conversations</li>
                <li>• Simulate sending messages</li>
                <li>• View message templates</li>
                <li>• Simulate creating templates</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Important Notes</h3>
              <ul className="space-y-2 text-yellow-700">
                <li>• All data is simulated</li>
                <li>• Messages won't actually send</li>
                <li>• Data resets on refresh</li>
                <li>• Can't receive real messages</li>
                <li>• Templates won't be submitted</li>
                <li>• For demo and testing only</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Simulated Data Preview</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded">
                    <div className="text-gray-500">Total Messages</div>
                    <div className="text-2xl font-bold text-blue-600">156</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="text-gray-500">Active Chats</div>
                    <div className="text-2xl font-bold text-green-600">8</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="text-gray-500">Templates</div>
                    <div className="text-2xl font-bold text-purple-600">5</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="text-gray-500">This Month</div>
                    <div className="text-2xl font-bold text-orange-600">156</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-700 mb-2">Conversations (3)</h4>
                <div className="bg-white p-3 rounded text-sm space-y-2">
                  <div>📱 +86 138 0013 8000 - "Hello, I'd like to inquire about products"</div>
                  <div>📱 +86 139 0013 9000 - "Order received, thank you!"</div>
                  <div>📱 +86 150 0015 0000 - "When can you ship?"</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-700 mb-2">Message Templates (3)</h4>
                <div className="bg-white p-3 rounded text-sm space-y-2">
                  <div>✅ welcome_message - Welcome to our service!</div>
                  <div>✅ order_confirmation - Your order is confirmed</div>
                  <div>⏳ shipping_update - Your package has been shipped</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Quick Test Steps</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                <span>Click "Go to Dashboard" button below</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                <span>View statistics on the Dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                <span>Go to "Messages" page and try sending a test message</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                <span>Go to "Templates" page and click "Create Template"</span>
              </li>
            </ol>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              View Messages
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              View Templates
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Book className="w-4 h-4" />
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoInfo;
