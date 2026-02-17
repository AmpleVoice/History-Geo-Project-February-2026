'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.auth.login(email, password);

          // Store token
          setAuthToken(response.accessToken);

          // Update state
          set({
            user: response.user as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (err: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.message || 'فشل تسجيل الدخول',
          });
          return false;
        }
      },

      logout: () => {
        setAuthToken(null);
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: () => {
        // Check if we have a stored user and token
        const state = get();
        if (state.user && typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            // Token was removed, log out
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Role-based permission helpers
export function canEdit(user: User | null): boolean {
  return user?.role === 'EDITOR' || user?.role === 'ADMIN';
}

export function canPublish(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function canManageUsers(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function isEditor(user: User | null): boolean {
  return user?.role === 'EDITOR' || user?.role === 'ADMIN';
}
