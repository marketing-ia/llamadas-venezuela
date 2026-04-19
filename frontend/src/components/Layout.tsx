import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'calls' | 'operators' | 'scripts' | 'analytics';
}

export function Layout({ children, currentPage }: LayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { tenant } = useStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'calls', label: 'Call Logs', path: '/calls' },
    { id: 'operators', label: 'Operators', path: '/operators' },
    { id: 'scripts', label: 'Sales Scripts', path: '/scripts' },
    { id: 'analytics', label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Calling Platform</h1>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">{tenant?.name}</div>
                  <div className="text-xs text-gray-500">{tenant?.id}</div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {tenant?.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl z-10 border border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
