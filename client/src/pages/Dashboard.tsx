import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, TrendingUp, Phone, PhoneMissed, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    messages: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    calls: {
      total: 0,
      today: 0,
      missed: 0,
      unviewed: 0,
      pickupRate: 0
    },
    templates: {
      total: 0,
      active: 0,
      paused: 0
    },
    quality: {
      excellent: 0,
      needsAttention: 0
    }
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get message statistics
      const messagesRes = await api.get('/messages').catch(() => ({ data: { messages: [] } }));
      const messages = messagesRes.data.messages || [];
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const messagesToday = messages.filter((m: any) => new Date(m.timestamp) >= today).length;
      const messagesWeek = messages.filter((m: any) => new Date(m.timestamp) >= weekAgo).length;
      const messagesMonth = messages.filter((m: any) => new Date(m.timestamp) >= monthAgo).length;

      // Get call statistics
      const callsRes = await api.get('/calls').catch(() => ({ data: { calls: [] } }));
      const calls = callsRes.data.calls || [];
      
      const callsToday = calls.filter((c: any) => new Date(c.created_at) >= today).length;
      const missedCalls = calls.filter((c: any) => c.status === 'missed').length;
      const completedCalls = calls.filter((c: any) => c.status === 'completed').length;
      const pickupRate = calls.length > 0 ? ((completedCalls / calls.length) * 100).toFixed(1) : '0';
      
      // Get unviewed missed calls count
      const unviewedRes = await api.get('/calls/unviewed-count').catch(() => ({ data: { count: 0 } }));
      const unviewedMissedCalls = unviewedRes.data.count || 0;

      // Get template statistics
      const templatesRes = await api.get('/templates').catch(() => ({ data: { templates: [] } }));
      const templates = templatesRes.data.templates || [];
      const activeTemplates = templates.filter((t: any) => t.status === 'APPROVED').length;
      const pausedTemplates = templates.filter((t: any) => t.status === 'PAUSED').length;

      // Get quality statistics
      const qualityRes = await api.get('/call/quality').catch(() => ({ data: { qualities: [] } }));
      const qualities = qualityRes.data.qualities || [];
      const excellent = qualities.filter((q: any) => (q.pickup_rate || 0) >= 90).length;
      const needsAttention = qualities.filter((q: any) => (q.pickup_rate || 0) < 60).length;

      setStats({
        messages: {
          total: messages.length,
          today: messagesToday,
          thisWeek: messagesWeek,
          thisMonth: messagesMonth
        },
        calls: {
          total: calls.length,
          today: callsToday,
          missed: missedCalls,
          unviewed: unviewedMissedCalls,
          pickupRate: parseFloat(pickupRate)
        },
        templates: {
          total: templates.length,
          active: activeTemplates,
          paused: pausedTemplates
        },
        quality: {
          excellent,
          needsAttention
        }
      });

      // Recent activities
      const activities = [
        ...messages.slice(0, 3).map((m: any) => ({
          type: 'message',
          text: `New message from ${m.from || 'Unknown'}`,
          time: m.timestamp,
          icon: MessageSquare,
          color: 'blue'
        })),
        ...calls.slice(0, 2).map((c: any) => ({
          type: 'call',
          text: `${c.status === 'completed' ? 'Completed' : 'Missed'} call ${c.direction === 'inbound' ? 'from' : 'to'} ${c.from_phone_number || c.to_phone_number}`,
          time: c.created_at,
          icon: c.status === 'completed' ? Phone : PhoneMissed,
          color: c.status === 'completed' ? 'green' : 'red'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      icon: MessageSquare, 
      label: 'Messages Today', 
      value: stats.messages.today, 
      total: stats.messages.total,
      color: 'bg-blue-500',
      link: '/messages'
    },
    { 
      icon: Phone, 
      label: 'Calls Today', 
      value: stats.calls.today, 
      total: stats.calls.total,
      color: 'bg-green-500',
      link: '/calls'
    },
    { 
      icon: PhoneMissed, 
      label: 'Missed Calls', 
      value: stats.calls.missed, 
      badge: stats.calls.unviewed > 0,
      color: 'bg-red-500',
      link: '/missed-calls'
    },
    { 
      icon: FileText, 
      label: 'Active Templates', 
      value: stats.templates.active, 
      total: stats.templates.total,
      color: 'bg-purple-500',
      link: '/templates'
    }
  ];

  const quickActions = [
    { label: 'Send Message', icon: MessageSquare, link: '/messages', color: 'green' },
    { label: 'Make Call', icon: Phone, link: '/calls', color: 'blue' },
    { label: 'Create Template', icon: FileText, link: '/templates', color: 'purple' },
    { label: 'View Analytics', icon: TrendingUp, link: '/call-analytics', color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 relative"
          >
            {card.badge && (
              <div className="absolute top-2 right-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                {card.total !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">of {card.total} total</p>
                )}
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`flex items-center justify-between p-3 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition-colors group`}
              >
                <div className="flex items-center gap-3">
                  <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  <span className="font-medium text-gray-700">{action.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 bg-${activity.color}-100 rounded-lg`}>
                    <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            {/* Call Quality */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Call Quality</span>
                <span className="text-sm text-green-600 font-semibold">{stats.calls.pickupRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${stats.calls.pickupRate >= 75 ? 'bg-green-500' : stats.calls.pickupRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${stats.calls.pickupRate}%` }}
                ></div>
              </div>
            </div>

            {/* Quality Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Excellent</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.quality.excellent}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-600">Needs Attention</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.quality.needsAttention}</p>
              </div>
            </div>

            {/* Templates Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Templates</span>
                <span className="text-xs text-gray-500">{stats.templates.total} total</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-green-50 rounded text-center">
                  <p className="text-xs text-gray-600">Active</p>
                  <p className="text-lg font-bold text-green-600">{stats.templates.active}</p>
                </div>
                <div className="flex-1 p-2 bg-yellow-50 rounded text-center">
                  <p className="text-xs text-gray-600">Paused</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.templates.paused}</p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-4 border-t flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Auto-refreshes every 30s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">This Week Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.messages.thisWeek}</p>
            <p className="text-sm text-gray-600 mt-1">Messages Sent</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.calls.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Calls</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.calls.pickupRate}%</p>
            <p className="text-sm text-gray-600 mt-1">Pickup Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
