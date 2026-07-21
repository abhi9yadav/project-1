import axios from 'axios';

// Centralized axios instance. The request interceptor automatically attaches
// the auth token from the stored user, so individual calls don't need to.
// Defaults to the same-origin "/api" (single-service deploy). Set VITE_API_URL
// at build time to point the frontend at a separately hosted backend.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const client = axios.create({
  baseURL,
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
