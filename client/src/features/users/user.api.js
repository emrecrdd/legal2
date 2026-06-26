import axios from '../../app/config/axios.js';

const userApi = {
  getAll: (params) => {
    return axios.get('/users', { params });
  },

  getOne: (id) => {
    return axios.get(`/users/${id}`);
  },

  getLawyers: () => {
    return axios.get('/users', { params: { role: 'lawyer' } });
  },

  update: (id, data) => {
    return axios.put(`/users/${id}`, data);
  },
};

export default userApi;