import axios from 'axios';

// Page code passes full paths like /api/students; the Vite proxy forwards /api to Express.
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('dms_token');
      localStorage.removeItem('dms_user');
      if (!window.location.pathname.includes('/login')) window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export const apiMessage = (error, fallback = 'Something went wrong') =>
  error.response?.data?.message || fallback;

export default api;
