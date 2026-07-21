import axios from 'axios';

// Centralized axios instance. The request interceptor automatically attaches
// the auth token from the stored user, so individual calls don't need to.
const client = axios.create({
  baseURL: '/api',
});

client.interceptors.request.use((config) => {
  const stored = localStorage.getItem('userInfo');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore malformed storage
    }
  }
  return config;
});

export default client;
