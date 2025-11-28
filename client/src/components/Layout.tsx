import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DemoModeBanner from './DemoModeBanner';

const Layout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isDemoMode = localStorage.getItem('demo_mode') === 'true';
  
  const navItems = [
    ...(isDemoMode ? [{ path: '/demo-info', icon: LayoutDashboard, label: 'Demo Info' }] : []),
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/templates', icon: FileText, label: 'Templates' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <DemoModeBanner />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-600">WhatsApp Platform</h1>
        </div>
        <nav className="mt-6">
          {navItems.map(item => (
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
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t">
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
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
};

export default Layout;
