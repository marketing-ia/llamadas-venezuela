import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store';

export function Login() {
  const [tenantKey, setTenantKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { error, setError } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantKey.trim()) {
      setError('Please enter your tenant key');
      return;
    }

    setIsSubmitting(true);
    const success = await login(tenantKey);
    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Calling Platform
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Manage your phone calls and sales operations
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-100 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenantKey" className="block text-sm font-medium text-gray-300 mb-2">
              Tenant Key
            </label>
            <input
              id="tenantKey"
              type="text"
              value={tenantKey}
              onChange={(e) => {
                setTenantKey(e.target.value);
                setError(null);
              }}
              placeholder="tenant1"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <p className="text-gray-500 text-xs mt-1">
              Demo: use <button type="button" className="text-blue-400 underline" onClick={() => setTenantKey('tenant1')}>tenant1</button>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !tenantKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 text-xs text-center mt-6">
          Contact your administrator if you don't have a tenant key
        </p>
      </div>
    </div>
  );
}
