import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
        await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
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
