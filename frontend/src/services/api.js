import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  config => {
    // Add guest session or auth token if present
    const sessionData = sessionStorage.getItem('healthmate_active_user');
    if (sessionData) {
      try {
        const user = JSON.parse(sessionData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        config.headers['X-User-Role'] = user.role;
      } catch (e) {
        // Silent catch for JSON parse
      }
    }

    const guestSession = sessionStorage.getItem('healthmate_guest_session');
    if (guestSession) {
      try {
        const guest = JSON.parse(guestSession);
        config.headers['X-Session-ID'] = guest.id;
      } catch (e) {}
    }

    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response.data,
  error => {
    const errorPayload = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Network error or backend service unreachable.',
      code: error.response?.data?.error || 'BACKEND_DISCONNECTED',
      isIntegrationPending: !error.response,
    };
    return Promise.reject(errorPayload);
  }
);

export default apiClient;
