import axios from 'axios';

// VITE_API_URL is the base domain (e.g. https://example.railway.app).
// We always append /api so individual request paths stay clean (e.g. /auth/login).
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${BASE}/api`;

// ✅ Create the instance with baseURL and withCredentials so cookies are always sent
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // critical: sends HttpOnly cookies on every request
});

// Debug logging (remove in production)
api.interceptors.request.use((config) => {
  console.log('Making request to:', config.url, 'with credentials:', config.withCredentials);
  return config;
});

// Flag to prevent multiple concurrent refresh attempts / logout redirects
let isRefreshing = false;
let isLoggingOut = false;
let refreshSubscribers: Array<() => void> = [];

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/me') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise<void>((resolve) => {
          refreshSubscribers.push(resolve);
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;

      try {
        await api.post('/auth/refresh'); // withCredentials is already set globally
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        if (!isLoggingOut) {
          isLoggingOut = true;
          console.warn('Refresh token failed, logging out:', refreshError);

          localStorage.clear();
          sessionStorage.clear();

          setTimeout(() => {
            isLoggingOut = false; // reset so future logins work
            window.location.href = '/login';
          }, 100);
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle timeout errors silently
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('API request timed out:', error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;
