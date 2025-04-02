// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000', // Fallback just in case
});

// Optional: Interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Check if running client-side before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dbirr_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle responses (e.g., 401 errors for logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Unauthorized - Token might be invalid or expired
      console.error('Unauthorized request, logging out...');
      localStorage.removeItem('dbirr_token');
      // Redirect to login page - This might require context or router access
      // window.location.href = '/auth/login'; // Simple redirect, but might cause full page reload
    }
    return Promise.reject(error);
  }
);

export default api;