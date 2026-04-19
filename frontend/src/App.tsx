import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CallLogs } from './pages/CallLogs';
import { Operators } from './pages/Operators';
import { Scripts } from './pages/Scripts';
import { Analytics } from './pages/Analytics';
import './App.css';

function App() {
  const { checkAuth, isLoading: authLoading } = useAuth();
  const { isLoading } = useStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const loading = authLoading || isLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calls"
          element={
            <ProtectedRoute>
              <CallLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operators"
          element={
            <ProtectedRoute>
              <Operators />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scripts"
          element={
            <ProtectedRoute>
              <Scripts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
