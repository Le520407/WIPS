import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, MessageSquare, FileText, LogOut, Shield, BookOpen, Webhook, Phone, Settings, ChevronDown, ChevronRight, TrendingUp, PhoneMissed, Users, Globe, Building2, ShoppingCart, UserCog } from 'lucide-react';
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
    { path: '/groups', icon: Users, label: 'Groups' },
  ];

  // Calling section - Simplified from 9 to 4 items
  const callingItems = [
    { path: '/calls', icon: Phone, label: 'Calls' },
    { path: '/missed-calls', icon: PhoneMissed, label: 'Missed Calls', badge: true },
    { path: '/call-settings', icon: Settings, label: 'Settings' },
    { path: '/call-button', icon: Phone, label: 'Call Button' },
  ];

  // Templates section - Simplified from 4 to 2 items
  const templateItems = [
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/quality', icon: Shield, label: 'Quality Monitor' },
  ];

  // Resources section
  const resourceItems = [
    { path: '/review-tips', icon: BookOpen, label: 'Review Tips' },
    { path: '/marketing-limits', icon: TrendingUp, label: 'Marketing Limits' },
    { path: '/pacing', icon: TrendingUp, label: 'Pacing' },
    { path: '/template-library', icon: BookOpen, label: 'Library' },
    { path: '/template-comparison', icon: BookOpen, label: 'Comparison' },
    { path: '/conversational-components', icon: MessageSquare, label: 'Conversational Components' },
  ];

  // Settings (always visible at bottom of nav)
  const settingsItems = [
    { path: '/account-settings', icon: Settings, label: 'Account Settings' },
    { path: '/business-profile', icon: Building2, label: 'Business Profile' },
    { path: '/commerce', icon: ShoppingCart, label: 'E-commerce' },
    { path: '/marketing', icon: TrendingUp, label: 'Marketing Campaigns' },
    { path: '/websites', icon: Globe, label: 'Website Management' },
    { path: '/webhook-settings', icon: Webhook, label: 'Webhook Settings' },
  ];

  // Admin section (only for admin/super_admin)
  const adminItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { path: '/admin/accounts', icon: Building2, label: 'Accounts' },
    { path: '/admin/users', icon: UserCog, label: 'Users' },
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

          {/* Admin Section */}
          <div className="mt-4 pt-4 border-t">
            <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
              Admin
            </div>
            {adminItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 ${
                  location.pathname === item.path ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-600' : ''
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
