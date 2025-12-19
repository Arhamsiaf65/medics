import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    // Initialize from local storage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error("Failed to parse user from local storage", e);
    }

    return {
        user,
        token,
        isAuthenticated: !!token,
        login: (user: User, token: string) => {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true });
        },
        logout: () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        },
    };
});
