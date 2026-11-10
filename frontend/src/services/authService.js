import apiClient from './api';

export const authService = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  verifyOtp: async (data) => {
    return apiClient.post('/auth/verify-otp', data);
  },

  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data) => {
    return apiClient.post('/auth/reset-password', data);
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  getProfile: async () => {
    return apiClient.get('/auth/me');
  }
};

export default authService;
