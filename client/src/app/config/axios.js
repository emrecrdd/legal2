import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Token ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    console.log('🔑 Interceptor çalıştı, tokens:', tokens); // ← BUNU EKLE!
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      console.log('✅ Token eklendi!'); // ← BUNU EKLE!
    } else {
      console.warn('⚠️ Token bulunamadı!');
    }
    return config;
  },
  (error) => {
    console.error('❌ Interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
        if (tokens?.refreshToken) {
          const response = await axios.post(
            `${API_URL}/auth/refresh-token`,
            { refreshToken: tokens.refreshToken }
          );
          
          const { accessToken, refreshToken } = response.data.data;
          localStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken }));
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;