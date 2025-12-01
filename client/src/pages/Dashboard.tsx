import { useEffect, useState } from 'react';
import { MessageSquare, Users, FileText, TrendingUp } from 'lucide-react';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    activeConversations: 0,
    templatesCount: 0,
    messagesThisWeek: 0,
    messagesThisMonth: 0
  });

  useEffect(() => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      // Demo mode: show simulated data
      setStats({
        totalMessages: 156,
        totalConversations: 23,
        activeConversations: 12,
        templatesCount: 8,
        messagesThisWeek: 45,
        messagesThisMonth: 156
      });
    } else {
      dashboardService.getStats()
        .then((data: any) => setStats(data.stats))
        .catch((err: any) => console.error(err));
    }
  }, []);

  const statCards = [
    { icon: MessageSquare, label: 'Total Messages', value: stats.totalMessages, color: 'bg-blue-500' },
    { icon: Users, label: 'Active Conversations', value: stats.activeConversations, color: 'bg-green-500' },
    { icon: FileText, label: 'Templates', value: stats.templatesCount, color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'This Month', value: stats.messagesThisMonth, color: 'bg-orange-500' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Platform Features
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Completed Features</span>
              <span className="text-2xl font-bold text-green-600">18/20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ✅ All core messaging features implemented<br/>
              ✅ Ready for App Review submission
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-2 bg-blue-50 rounded">✅ Text & Templates</div>
              <div className="p-2 bg-blue-50 rounded">✅ Media Messages</div>
              <div className="p-2 bg-blue-50 rounded">✅ Interactive Buttons</div>
              <div className="p-2 bg-blue-50 rounded">✅ Location & Contacts</div>
              <div className="p-2 bg-blue-50 rounded">✅ Reactions & Replies</div>
              <div className="p-2 bg-blue-50 rounded">✅ Typing Indicators</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/messages" className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="font-medium">Send New Message</div>
              <div className="text-sm text-gray-600">Start a conversation</div>
            </a>
            <a href="/templates" className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="font-medium">Create New Template</div>
              <div className="text-sm text-gray-600">Design message templates</div>
            </a>
            <div className="p-4 bg-purple-50 rounded-lg mt-4">
              <div className="font-medium text-purple-900 mb-2">📱 Next Steps</div>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Record demo video</li>
                <li>• Prepare test account</li>
                <li>• Submit for App Review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
