/**
 * PayOps AI - API Client
 * 
 * Clean Axios architecture configured for FastAPI backend integration.
 * Includes JWT auth token injection, automatic token refresh, and 401 redirect handling.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for attaching auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('payops_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with seamless token refresh and 401 redirect handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle 401 Unauthorized for authenticated endpoints (excluding login/refresh)
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = localStorage.getItem('payops_auth_token');
      if (currentToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            null,
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            }
          );
          const newToken = res.data?.access_token;
          if (newToken) {
            localStorage.setItem('payops_auth_token', newToken);
            apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('payops_auth_token');
          localStorage.removeItem('payops_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const errorObj = error.response?.data?.error;
    const customError = {
      message:
        errorObj?.message ||
        error.response?.data?.detail ||
        error.message ||
        'An unexpected error occurred.',
      code: errorObj?.code || 'UNKNOWN_ERROR',
      details: errorObj?.details,
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);
