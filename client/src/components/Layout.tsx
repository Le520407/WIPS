import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, MessageSquare, FileText, FolderOpen, LogOut, Shield, AlertTriangle, BookOpen, Webhook, Phone, Settings, ChevronDown, ChevronRight, TrendingUp, Zap, Library, GitCompare, PhoneMissed, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DemoModeBanner from './DemoModeBanner';
import MissedCallBadge from './MissedCallBadge';

const Layout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [callingOpen, setCallingOpen] = useState(true);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const isDemoMode = localStorage.getItem('demo_mode') === 'true';
  
  // Main navigation items (always visible)
  const mainNavItems = [
    ...(isDemoMode ? [{ path: '/demo-info', icon: LayoutDashboard, label: 'Demo Info' }] : []),
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  // Calling section
  const callingItems = [
    { path: '/calls', icon: Phone, label: 'Calls' },
    { path: '/missed-calls', icon: PhoneMissed, label: 'Missed Calls', badge: true },
    { path: '/call-settings', icon: Settings, label: 'Settings' },
    { path: '/call-quality', icon: TrendingUp, label: 'Quality' },
    { path: '/call-limits', icon: BarChart3, label: 'Limits' },
    { path: '/call-button', icon: Phone, label: 'Call Button' },
    { path: '/call-analytics', icon: PieChart, label: 'Analytics' },
  ];

  // Templates section
  const templateItems = [
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/template-groups', icon: FolderOpen, label: 'Groups' },
    { path: '/quality', icon: Shield, label: 'Quality' },
    { path: '/paused', icon: AlertTriangle, label: 'Paused' },
  ];

  // Resources section
  const resourceItems = [
    { path: '/review-tips', icon: BookOpen, label: 'Review Tips' },
    { path: '/marketing-limits', icon: Zap, label: 'Marketing Limits' },
    { path: '/pacing', icon: TrendingUp, label: 'Pacing' },
    { path: '/template-library', icon: Library, label: 'Library' },
    { path: '/template-comparison', icon: GitCompare, label: 'Comparison' },
  ];

  // Settings (always visible at bottom of nav)
  const settingsItems = [
    { path: '/webhook-settings', icon: Webhook, label: 'Webhook Settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <DemoModeBanner />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Header - Fixed at top */}
        <div className="p-6 flex-shrink-0 border-b">
          <h1 className="text-2xl font-bold text-green-600">WhatsApp Platform</h1>
        </div>
        
        {/* Navigation - Scrollable middle section */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Main Navigation */}
          {mainNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 ${
                location.pathname === item.path ? 'bg-green-50 text-green-600 border-r-4 border-green-600' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
          
          {/* Calling Section */}
          <div className="mt-2">
            <button
              onClick={() => setCallingOpen(!callingOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium"
            >
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                <span>Calling</span>
              </div>
              {callingOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {callingOpen && (
              <div className="bg-gray-50">
                {callingItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-6 py-2 pl-14 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 ${
                      location.pathname === item.path ? 'bg-green-50 text-green-600 border-r-4 border-green-600' : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {(item as any).badge && <MissedCallBadge />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Templates Section */}
          <div className="mt-2">
            <button
              onClick={() => setTemplatesOpen(!templatesOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                <span>Templates</span>
              </div>
              {templatesOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {templatesOpen && (
              <div className="bg-gray-50">
                {templateItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-6 py-2 pl-14 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 ${
                      location.pathname === item.path ? 'bg-green-50 text-green-600 border-r-4 border-green-600' : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Resources Section */}
          <div className="mt-2">
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium"
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-3" />
                <span>Resources</span>
              </div>
              {resourcesOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {resourcesOpen && (
              <div className="bg-gray-50">
                {resourceItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-6 py-2 pl-14 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 ${
                      location.pathname === item.path ? 'bg-green-50 text-green-600 border-r-4 border-green-600' : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="mt-4 pt-4 border-t">
            {settingsItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 ${
                  location.pathname === item.path ? 'bg-green-50 text-green-600 border-r-4 border-green-600' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        
        {/* Logout - Fixed at bottom */}
        <div className="flex-shrink-0 p-6 border-t bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-600" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
      </div>
    </div>
  );
};

export default Layout;
