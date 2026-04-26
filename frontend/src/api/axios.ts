import axios from 'axios';
import { message } from 'antd';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/me') {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        // Retry the original request; axios will automatically include the new cookie!
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, we're fully logged out
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
