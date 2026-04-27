import { create } from 'zustand';
import api from '../api/axios';

export type Role = 'Patient' | 'Doctor' | 'Admin' | '';

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  isInitializing: boolean;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitializing: true,
  setAuth: (user) => {
    set({ user });
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { }
    localStorage.removeItem('token'); // Clear the Bearer token
    set({ user: null });
    window.location.href = '/login';
  },
  verifySession: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isInitializing: false });
    } catch (error) {
      set({ user: null, isInitializing: false });
    }
  },
  isAuthenticated: () => !!get().user
}));
