import axios from 'axios';

// In local dev, VITE_API_URL is intentionally unset so axios uses the relative '/api' path.
// Vite's dev server proxy (vite.config.ts) intercepts /api/* and forwards to the backend.
// This makes cookies same-origin (localhost:5173) → no SameSite/CORS cookie issues.
// Set VITE_API_URL in Vercel/Local env to point to your Railway backend
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://medics-production.up.railway.app/';
const API_URL = `${BACKEND_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Still safe to leave true, even if we are using Bearer tokens now
});

// Attach token to every request if we have it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized (and it's not an auth endpoint failing)
    // we simply log the user out. No complex refresh token loops.
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/me')) {
      console.warn('Session expired. Logging out.');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }

    // Handle timeout errors silently
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('API request timed out:', error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;
