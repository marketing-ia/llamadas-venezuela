import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { useVoiceContext } from '../context/VoiceDeviceContext';
import { IncomingCall } from './IncomingCall';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function Layout({ children, currentPage }: LayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { deviceState, activeCall, incoming, register, hangUp, acceptIncoming, rejectIncoming } = useVoiceContext();

  // Register the voice device as soon as the user is in the app
  useEffect(() => {
    if (user && deviceState === 'unregistered') {
      register().catch(() => {}); // non-fatal
    }
  }, [user, deviceState, register]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'calls', label: 'Llamadas', path: '/calls' },
    { id: 'operators', label: 'Operadores', path: '/operators' },
    { id: 'scripts', label: 'Scripts', path: '/scripts' },
    { id: 'analytics', label: 'Analytics', path: '/analytics' },
    ...(user?.role === 'master' ? [{ id: 'admin', label: 'Pruebas', path: '/admin' }] : []),
  ];

  const trial = user?.trialInfo;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Trial banner */}
      {trial && (
        <div className={`w-full text-center py-2 text-sm font-medium ${
          trial.callsRemaining === 0 ? 'bg-red-900/80 text-red-200' :
          trial.callsRemaining <= 2 ? 'bg-yellow-900/80 text-yellow-200' :
          'bg-blue-900/60 text-blue-200'
        }`}>
          {trial.callsRemaining === 0
            ? 'Has alcanzado el límite de llamadas de prueba'
            : `Cuenta de prueba — ${trial.callsRemaining} llamada${trial.callsRemaining !== 1 ? 's' : ''} restante${trial.callsRemaining !== 1 ? 's' : ''} · Vence ${new Date(trial.expiresAt).toLocaleDateString('es-VE')}`
          }
        </div>
      )}

      {/* Active call bar */}
      {activeCall && (
        <div className="w-full bg-green-800 border-b border-green-600 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" />
            <span className="text-green-100 text-sm font-medium">Llamada activa en curso</span>
          </div>
          <button
            onClick={hangUp}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            Colgar
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Llamadas Venezuela</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                deviceState === 'registered' ? 'bg-green-900/60 text-green-400' :
                deviceState === 'registering' ? 'bg-yellow-900/60 text-yellow-400' :
                deviceState === 'error' ? 'bg-red-900/60 text-red-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {deviceState === 'registered' ? 'Listo para llamadas' :
                 deviceState === 'registering' ? 'Conectando...' :
                 deviceState === 'error' ? 'Error de voz' : 'Sin audio'}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">
                    {user?.role === 'master' ? 'Administrador' : 'Cuenta de prueba'}
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg z-10 border border-slate-700">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-b-lg transition-colors"
                  >
                    Cerrar sesión
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
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
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

      {/* Incoming call notification */}
      {incoming && (
        <IncomingCall
          incoming={incoming}
          onAccept={acceptIncoming}
          onReject={rejectIncoming}
        />
      )}
    </div>
  );
}
