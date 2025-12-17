import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, MessageSquare, FileText, LogOut, Shield, BookOpen, Webhook, Phone, Settings, ChevronDown, ChevronRight, TrendingUp, PhoneMissed, Users, Globe, Building2, ShoppingCart, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DemoModeBanner from './DemoModeBanner';
import MissedCallBadge from './MissedCallBadge';

const Layout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [callingOpen, setCallingOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const isDemoMode = localStorage.getItem('demo_mode') === 'true';
  
  // Main navigation items (always visible)
  const mainNavItems = [
    ...(isDemoMode ? [{ path: '/app/demo-info', icon: LayoutDashboard, label: 'Demo Info' }] : []),
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/app/groups', icon: Users, label: 'Groups' },
  ];

  // Messaging & Communication
  const messagingItems = [
    { path: '/app/templates', icon: FileText, label: 'Templates' },
    { path: '/app/conversational-components', icon: MessageSquare, label: 'Interactive Messages' },
    { path: '/app/authentication-templates', icon: Shield, label: 'OTP Templates' },
  ];

  // Calling section
  const callingItems = [
    { path: '/app/calls', icon: Phone, label: 'Calls' },
    { path: '/app/missed-calls', icon: PhoneMissed, label: 'Missed Calls', badge: true },
    { path: '/app/call-settings', icon: Settings, label: 'Call Settings' },
    { path: '/app/call-button', icon: Phone, label: 'Call Button' },
  ];

  // Marketing & Commerce
  const marketingItems = [
    { path: '/app/marketing', icon: TrendingUp, label: 'Marketing Campaigns' },
    { path: '/app/marketing-limits', icon: TrendingUp, label: 'Marketing Limits' },
    { path: '/app/commerce', icon: ShoppingCart, label: 'E-commerce' },
  ];

  // Account Management
  const accountItems = [
    { path: '/app/phone-number-status', icon: Phone, label: 'Phone Status' },
    { path: '/app/phone-registration', icon: Phone, label: 'Phone Registration' },
    { path: '/app/display-name', icon: FileText, label: 'Display Name' },
    { path: '/app/business-profile', icon: Building2, label: 'Business Profile' },
    { path: '/app/two-step-verification', icon: Shield, label: 'Two-Step Verification' },
  ];

  // Quality & Monitoring
  const monitoringItems = [
    { path: '/app/quality', icon: Shield, label: 'Quality Monitor' },
    { path: '/app/pacing', icon: TrendingUp, label: 'Pacing Monitor' },
  ];

  // Integration & Settings
  const integrationItems = [
    { path: '/app/websites', icon: Globe, label: 'Website Management' },
    { path: '/app/webhook-settings', icon: Webhook, label: 'Webhook Settings' },
    { path: '/app/blocked-users', icon: Shield, label: 'Blocked Users' },
    { path: '/app/account-settings', icon: Settings, label: 'Account Settings' },
  ];

  // Resources & Tools
  const resourceItems = [
    { path: '/app/review-tips', icon: BookOpen, label: 'Review Tips' },
    { path: '/app/template-library', icon: BookOpen, label: 'Template Library' },
    { path: '/app/template-comparison', icon: BookOpen, label: 'Template Comparison' },
  ];

  // Admin section (only for admin/super_admin)
  const adminItems = [
    { path: '/app/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { path: '/app/admin/accounts', icon: Building2, label: 'Accounts' },
    { path: '/app/admin/users', icon: UserCog, label: 'Users' },
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
          
          {/* Messaging & Communication */}
          <div className="mt-2">
            <button
              onClick={() => setMessagingOpen(!messagingOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Messaging</span>
              </div>
              {messagingOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {messagingOpen && (
              <div className="bg-gray-50">
                {messagingItems.map(item => (
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

          {/* Calling Section */}
          <div className="mt-2">
            <button
              onClick={() => setCallingOpen(!callingOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Calling</span>
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

          {/* Marketing & Commerce */}
          <div className="mt-2">
            <button
              onClick={() => setMarketingOpen(!marketingOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <TrendingUp className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Marketing</span>
              </div>
              {marketingOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {marketingOpen && (
              <div className="bg-gray-50">
                {marketingItems.map(item => (
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

          {/* Account Management */}
          <div className="mt-2">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <Building2 className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Account</span>
              </div>
              {accountOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {accountOpen && (
              <div className="bg-gray-50">
                {accountItems.map(item => (
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

          {/* Quality & Monitoring */}
          <div className="mt-2">
            <button
              onClick={() => setMonitoringOpen(!monitoringOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Monitoring</span>
              </div>
              {monitoringOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {monitoringOpen && (
              <div className="bg-gray-50">
                {monitoringItems.map(item => (
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

          {/* Integration & Settings */}
          <div className="mt-2">
            <button
              onClick={() => setIntegrationOpen(!integrationOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </div>
              {integrationOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {integrationOpen && (
              <div className="bg-gray-50">
                {integrationItems.map(item => (
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

          {/* Resources & Tools Section */}
          <div className="mt-2">
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-left"
            >
              <div className="flex items-center min-w-0">
                <BookOpen className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">Resources</span>
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
