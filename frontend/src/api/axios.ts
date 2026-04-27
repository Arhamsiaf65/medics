import axios from 'axios';

// Default to the local proxy path in development.
// If VITE_API_URL is set, use that backend instead.
const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const API_URL = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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
