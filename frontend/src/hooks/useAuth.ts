import { useCallback } from 'react';
import { apiClient } from '../services/api';
import { useStore } from '../store';

export function useAuth() {
  const { setUser, setLoading, setError, setAuthChecked, logout: storeLogout, isLoading } = useStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.login(email, password);
        const user = response.user;
        apiClient.setTenantId(user.tenantId);
        localStorage.setItem('tenantId', user.tenantId);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        setUser(user);
        return true;
      } catch (error: any) {
        setError(error.error || 'Error al iniciar sesión');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      localStorage.removeItem('tenantId');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
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
        if (response.authenticated && response.user) {
          setUser(response.user);
          return true;
        }
      } catch {
        localStorage.removeItem('tenantId');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
      }
    }
    setAuthChecked();
    return false;
  }, [setUser, setAuthChecked]);

  return { login, logout, checkAuth, isLoading };
}
