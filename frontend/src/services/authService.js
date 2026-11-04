import { apiClient } from './apiClient';
import { FIXTURE_USER } from '../data/fixtures';

export const authService = {
  /**
   * Authenticate with email & password against FastAPI backend.
   * Falls back to offline fixture if backend is unreachable.
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user_id, email: userEmail, role } = response.data;
      if (access_token) {
        localStorage.setItem('payops_auth_token', access_token);
      }

      // Retrieve full user profile from /auth/me with new token
      let userProfile = null;
      try {
        const meResponse = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        userProfile = meResponse.data?.data || meResponse.data;
      } catch (meError) {
        userProfile = {
          id: user_id,
          email: userEmail || email,
          full_name: (userEmail || email).split('@')[0],
          role: typeof role === 'string' ? { id: role, name: role } : role,
          is_active: true,
        };
      }

      if (userProfile) {
        localStorage.setItem('payops_user', JSON.stringify(userProfile));
      }

      return {
        success: true,
        token: access_token,
        user: userProfile,
        isLive: true,
      };
    } catch (err) {
      // If network error (backend not running or connection refused), provide fallback for smooth dev
      if (!err.status || err.message?.includes('Network Error') || err.message?.includes('failed')) {
        console.warn('Backend not reachable; falling back to local credentials session.');
        const fallbackUser = {
          ...FIXTURE_USER,
          email,
        };
        localStorage.setItem('payops_auth_token', 'dev_mock_jwt_token_payops_2026');
        localStorage.setItem('payops_user', JSON.stringify(fallbackUser));
        return {
          success: true,
          token: 'dev_mock_jwt_token_payops_2026',
          user: fallbackUser,
          isLive: false,
          warning: 'Connected in local fallback mode (Backend unreachable).',
        };
      }
      throw err;
    }
  },

  /**
   * Refresh current JWT session against FastAPI /api/v1/auth/refresh.
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem('payops_auth_token', access_token);
      }
      return { success: true, token: access_token };
    } catch (err) {
      console.warn('Token refresh failed:', err);
      throw err;
    }
  },

  /**
   * Retrieve current authenticated user profile (/api/v1/auth/me).
   */
  async getMe() {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data?.data || response.data;
      if (userData) {
        localStorage.setItem('payops_user', JSON.stringify(userData));
      }
      return { data: userData, isLive: true };
    } catch (err) {
      const cached = localStorage.getItem('payops_user');
      if (cached) {
        try {
          return { data: JSON.parse(cached), isLive: false };
        } catch {
          // parse failed
        }
      }
      return { data: FIXTURE_USER, isLive: false };
    }
  },

  /**
   * Clear session tokens, revoke active JWT on backend, and terminate session.
   */
  async logout() {
    try {
      // Invalidate token on server-side blacklist
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Server logout notification error, clearing local credentials anyway:', err);
    } finally {
      localStorage.removeItem('payops_auth_token');
      localStorage.removeItem('payops_user');
    }
  },

  /**
   * Get cached token from local storage.
   */
  getToken() {
    return localStorage.getItem('payops_auth_token');
  },

  /**
   * Get cached user from local storage.
   */
  getCachedUser() {
    try {
      const u = localStorage.getItem('payops_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
};
