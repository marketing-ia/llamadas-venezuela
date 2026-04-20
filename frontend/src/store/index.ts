import { create } from 'zustand';
import { Tenant } from '../types';

interface StoreState {
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authChecked: boolean;
  error: string | null;

  setTenant: (tenant: Tenant) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthChecked: () => void;
}

export const useStore = create<StoreState>((set) => ({
  tenant: null,
  isAuthenticated: false,
  isLoading: false,
  authChecked: false,
  error: null,

  setTenant: (tenant: Tenant) =>
    set({
      tenant,
      isAuthenticated: true,
      authChecked: true,
      error: null,
    }),

  logout: () =>
    set({
      tenant: null,
      isAuthenticated: false,
      authChecked: true,
      error: null,
    }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  setAuthChecked: () =>
    set({ authChecked: true }),
}));
