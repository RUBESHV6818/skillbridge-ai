import axios from 'axios';

/**
 * SkillBridge AI - Unified API Client
 *
 * Configured with a single toggle: USE_MOCK.
 * When USE_MOCK is true, all service functions return realistic,
 * human-tailored mock data with authentic Indian engineering college contexts.
 * When switched to false, requests pass through to the real Node/Express backend.
 */

export const USE_MOCK = true;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('skillbridge_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Simulates a realistic network delay for mock responses (180ms - 320ms)
 */
export const mockDelay = (data, delayMs = 240) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK' });
    }, delayMs);
  });
};

export default api;
