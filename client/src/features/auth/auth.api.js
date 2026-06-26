import axios from '../../app/config/axios.js';

const authApi = {
  login: (email, password) => {
    return axios.post('/auth/login', { email, password });
  },

  register: (userData) => {
    return axios.post('/auth/register', userData);
  },

  logout: () => {
    return axios.post('/auth/logout');
  },

  getProfile: () => {
    return axios.get('/auth/profile');
  },

  refreshToken: (refreshToken) => {
    return axios.post('/auth/refresh-token', { refreshToken });
  },

  changePassword: (data) => {
    return axios.put('/auth/change-password', data);
  },

  forgotPassword: (email) => {
    return axios.post('/auth/forgot-password', { email });
  },

  resetPassword: (token, password) => {
    return axios.post('/auth/reset-password', { token, password });
  },
};

export default authApi;