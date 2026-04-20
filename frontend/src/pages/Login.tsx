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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Calling Platform
          </h1>
          <p className="text-slate-400">
            Manage your phone calls and sales operations
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenantKey" className="block text-sm font-medium text-slate-300 mb-2">
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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              disabled={isSubmitting}
            />
            <p className="text-slate-500 text-xs mt-1">
              Demo:{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={() => setTenantKey('tenant1')}
              >
                tenant1
              </button>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !tenantKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-slate-500 text-xs text-center mt-6">
          Contact your administrator if you don't have a tenant key
        </p>
      </div>
    </div>
  );
}
