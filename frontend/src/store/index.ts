import { create } from 'zustand';
import { Tenant } from '../types';

interface StoreState {
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setTenant: (tenant: Tenant) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  tenant: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setTenant: (tenant: Tenant) =>
    set({
      tenant,
      isAuthenticated: true,
      error: null,
    }),

  logout: () =>
    set({
      tenant: null,
      isAuthenticated: false,
      error: null,
    }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),
}));
