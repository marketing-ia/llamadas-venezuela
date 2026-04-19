import { useCallback } from 'react';
import { apiClient } from '../services/api';
import { useStore } from '../store';

export function useAuth() {
  const { setTenant, setLoading, setError, logout: storeLogout } = useStore();

  const login = useCallback(
    async (tenantKey: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.login(tenantKey);
        const tenantId = response.tenant.id;

        apiClient.setTenantId(tenantId);
        localStorage.setItem('tenantId', tenantId);
        localStorage.setItem('tenantName', response.tenant.name);

        setTenant(response.tenant);
        return true;
      } catch (error: any) {
        setError(error.error || 'Login failed');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setTenant, setLoading, setError]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      localStorage.removeItem('tenantId');
      localStorage.removeItem('tenantName');
      apiClient.clearTenantId();
      storeLogout();
    } catch (error: any) {
      setError(error.error || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, storeLogout]);

  const checkAuth = useCallback(async () => {
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      apiClient.setTenantId(tenantId);
      try {
        const response = await apiClient.verifyAuth();
        if (response.authenticated) {
          const tenantName = localStorage.getItem('tenantName') || 'Tenant';
          setTenant({ id: tenantId, name: tenantName, timezone: 'UTC', createdAt: '', updatedAt: '' });
          return true;
        }
      } catch {
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantName');
      }
    }
    return false;
  }, [setTenant]);

  return { login, logout, checkAuth };
}
