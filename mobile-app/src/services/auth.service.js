import api from './api';

const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  refreshToken: async () => {
    return api.post('/auth/refresh-token');
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  }
};

export default authService;
