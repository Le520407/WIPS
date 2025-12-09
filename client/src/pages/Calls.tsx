import { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Calendar, Video } from 'lucide-react';
import api from '../services/api';
import { WebRTCCall } from '../components/WebRTCCall';
import { useSignaling } from '../hooks/useSignaling';
import { useAuth } from '../contexts/AuthContext';

interface Call {
  id: string;
  call_id: string;
  from_number: string;
  to_number: string;
  type: 'incoming' | 'outgoing';
  status: 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed';
  duration?: number;
  start_time: string;
  end_time?: string;
  context?: string;
}

interface CallStats {
  total: number;
  incoming: number;
  outgoing: number;
  connected: number;
  missed: number;
  rejected: number;
  failed: number;
  totalDuration: number;
  averageDuration: number;
}

const Calls = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInitiateCall, setShowInitiateCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'missed' | 'rejected'>('all');
  
  // WebRTC state
  const [showWebRTCCall, setShowWebRTCCall] = useState(false);
  const [webrtcTarget, setWebrtcTarget] = useState<{ userId: string; userName: string } | null>(null);
  const [incomingWebRTCCall, setIncomingWebRTCCall] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  
  // Initialize signaling
  const { isConnected: isSignalingConnected, onlineUsers: signalingOnlineUsers } = useSignaling({
    userId: user?.id || user?.email || 'anonymous',
    userName: user?.email || user?.name || 'Unknown User',
    onIncomingCall: (call) => {
      console.log('📞 Incoming WebRTC call:', call);
      setIncomingWebRTCCall(call);
    },
  });
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Debug - Current user:', user);
    console.log('🔍 Debug - User ID:', user?.id);
    console.log('🔍 Debug - Signaling connected:', isSignalingConnected);
    console.log('🔍 Debug - Online users from signaling:', signalingOnlineUsers);
  }, [user, isSignalingConnected, signalingOnlineUsers]);
  
  // Update online users
  useEffect(() => {
    const currentUserId = user?.id || user?.email;
    const filtered = signalingOnlineUsers.filter(u => u.userId !== currentUserId);
    console.log('🔍 Debug - Filtered online users:', filtered);
    setOnlineUsers(filtered);
  }, [signalingOnlineUsers, user?.id, user?.email]);

  useEffect(() => {
    loadCalls();
    loadStats();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadCalls();
      loadStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [filterType, filterStatus]);

  const loadCalls = async () => {
    try {
      const params: any = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await api.get('/calls', { params });
      setCalls(response.data.calls || []);
    } catch (error) {
      console.error('Failed to load calls:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/calls/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleInitiateCall = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      await api.post('/calls', {
        to: phoneNumber,
        context: 'manual_call',
      });
      
      alert('✅ Call initiated successfully!');
      setPhoneNumber('');
      setShowInitiateCall(false);
      loadCalls();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      
      if (errorMsg.includes('not enabled') || errorMsg.includes('Calling API')) {
        alert(
          '❌ Calling API not enabled\n\n' +
          'To use WhatsApp Calling:\n' +
          '1. Go to Meta Business Manager\n' +
          '2. Select your phone number\n' +
          '3. Enable "Calling API" in Phone Number Call Settings\n' +
          '4. For testing, use a Sandbox account or public test number\n\n' +
          'See docs/12-04v2/CALLING_BUG_FIX.md for details'
        );
      } else {
        alert('❌ Failed to initiate call: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ended':
        return 'text-green-600 bg-green-50';
      case 'missed':
        return 'text-red-600 bg-red-50';
      case 'rejected':
        return 'text-orange-600 bg-orange-50';
      case 'ringing':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCallIcon = (call: Call) => {
    if (call.type === 'incoming') {
      if (call.status === 'missed') {
        return <PhoneMissed className="w-5 h-5 text-red-600" />;
      }
      return <PhoneIncoming className="w-5 h-5 text-green-600" />;
    }
    return <PhoneOutgoing className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="p-6">
      {/* WebRTC Call Component */}
      {showWebRTCCall && webrtcTarget && (
        <WebRTCCall
          targetUserId={webrtcTarget.userId}
          targetUserName={webrtcTarget.userName}
          onCallEnd={() => {
            setShowWebRTCCall(false);
            setWebrtcTarget(null);
          }}
        />
      )}
      
      {/* Incoming WebRTC Call */}
      {incomingWebRTCCall && (
        <WebRTCCall
          incomingCall={incomingWebRTCCall}
          onCallEnd={() => setIncomingWebRTCCall(null)}
        />
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              WebRTC Call ({onlineUsers.length})
            </button>
            <button
              onClick={() => setShowInitiateCall(!showInitiateCall)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Call
            </button>
          </div>
        </div>
        
        {/* WebRTC Status */}
        <div className={`mb-4 p-3 rounded-lg ${isSignalingConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSignalingConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm font-medium">
              {isSignalingConnected ? '✅ WebRTC Ready' : '⏳ Connecting to WebRTC server...'}
            </span>
            {isSignalingConnected && (
              <span className="text-sm text-gray-600">
                • {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
              </span>
            )}
          </div>
        </div>
        
        {/* Online Users List */}
        {showOnlineUsers && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="font-semibold mb-3">Online Users - WebRTC Call</h3>
            {onlineUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No other users online</p>
            ) : (
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">{user.userName || user.userId}</span>
                    </div>
                    <button
                      onClick={() => {
                        setWebrtcTarget({
                          userId: user.userId,
                          userName: user.userName || user.userId,
                        });
                        setShowWebRTCCall(true);
                        setShowOnlineUsers(false);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      Call
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">⚠️ 重要：企业不能直接打电话给用户！</h3>
              <p className="text-sm text-red-800 mb-2">
                WhatsApp 要求企业必须先获得用户的通话权限才能发起通话。这是为了保护用户隐私。
              </p>
              <div className="bg-white rounded p-3 mb-2">
                <p className="text-sm font-medium text-gray-900 mb-1">✅ 推荐方案：</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>发送带通话按钮的消息，让用户点击发起通话</li>
                  <li>分享通话链接：https://wa.me/YOUR_NUMBER?call=1</li>
                  <li>在个人资料中启用通话功能</li>
                </ul>
              </div>
              <p className="text-xs text-red-700">
                📖 详见 <code className="bg-red-100 px-1 rounded">docs/12-04v2/CALLING_PERMISSION_REQUIRED.md</code>
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">🎯 Calling API Configuration Required</h3>
              <p className="text-sm text-blue-800 mb-2">
                To use WhatsApp Calling, you must enable it in Meta Business Manager:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Go to your phone number settings in Meta Business Manager</li>
                <li>Enable "Calling API" in Phone Number Call Settings</li>
                <li><strong>🔥 Sandbox Account</strong>: 100 calls/day (vs 10 for production) - Perfect for testing!</li>
                <li>Production: Requires 2000+ messaging conversations/24h</li>
              </ul>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ You have Sandbox Account
                </span>
                <span className="text-xs text-blue-700">
                  📖 See <code className="bg-blue-100 px-1 rounded">docs/12-04v2/SANDBOX_SETUP_GUIDE.md</code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Initiate Call Form */}
        {showInitiateCall && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="font-semibold mb-3">Initiate Outgoing Call</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., 60105520735)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleInitiateCall}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Calling...' : 'Call'}
              </button>
              <button
                onClick={() => setShowInitiateCall(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                📱 Format: Country code + number (no + or spaces)
              </p>
              <p className="text-xs text-gray-400">
                Examples: 60105520735 (Malaysia), 8613800138000 (China), 14155552671 (US)
              </p>
              <p className="text-xs text-orange-600">
                ⚠️ Limit: 10 calls per user per 24 hours (Real Account)
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Connected</p>
                  <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
                </div>
                <PhoneIncoming className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.missed}</p>
                </div>
                <PhoneMissed className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold text-blue-600">{formatDuration(stats.averageDuration)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="incoming">Incoming</option>
                <option value="outgoing">Outgoing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="connected">Connected</option>
                <option value="missed">Missed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Call List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Call History</h2>
        </div>
        
        <div className="divide-y">
          {calls.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No calls yet</p>
            </div>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCallIcon(call)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {call.type === 'incoming' ? call.from_number : call.to_number}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(call.start_time)}
                        {call.duration && (
                          <>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            {formatDuration(call.duration)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {call.type === 'incoming' ? 'Incoming' : 'Outgoing'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Calls;
