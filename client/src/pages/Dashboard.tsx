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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              Send New Message
            </button>
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Create New Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
