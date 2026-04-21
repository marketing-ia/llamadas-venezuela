import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppUser } from '../types';

interface StoreState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authChecked: boolean;
  error: string | null;

  setUser: (user: AppUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthChecked: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      authChecked: false,
      error: null,

      setUser: (user: AppUser, token: string) =>
        set({ user, token, isAuthenticated: true, authChecked: true, error: null }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, authChecked: true, error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      setAuthChecked: () => set({ authChecked: true }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
