import { useCallback } from 'react';
import { apiClient } from '../services/api';
import { useStore } from '../store';

export function useAuth() {
  const { setUser, setLoading, setError, setAuthChecked, logout: storeLogout, token, isLoading } = useStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.login(email, password);
        const { user, token } = response;
        apiClient.setToken(token);
        apiClient.setTenantId(user.tenantId);
        setUser(user, token);
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
    } catch { /* stateless JWT logout is always ok */ } finally {
      apiClient.clearAuth();
      storeLogout();
      setLoading(false);
    }
  }, [setLoading, storeLogout]);

  const checkAuth = useCallback(async () => {
    const { token: storedToken, user: storedUser } = useStore.getState();
    if (storedToken && storedUser) {
      apiClient.setToken(storedToken);
      apiClient.setTenantId(storedUser.tenantId);
      try {
        const response = await apiClient.verifyAuth();
        if (response.authenticated && response.user) {
          setUser(response.user, storedToken);
          return true;
        }
      } catch {
        storeLogout();
      }
    }
    setAuthChecked();
    return false;
  }, [setUser, setAuthChecked, storeLogout]);

  return { login, logout, checkAuth, isLoading };
}
