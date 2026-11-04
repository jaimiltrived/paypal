import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { FIXTURE_USER } from '../data/fixtures';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authService.getToken());
  const [user, setUser] = useState(() => authService.getCachedUser() || FIXTURE_USER);
  const [loading, setLoading] = useState(true);
  const [isBackendLive, setIsBackendLive] = useState(false);

  const checkAuth = useCallback(async () => {
    const storedToken = authService.getToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.data) {
        setUser(res.data);
        setIsBackendLive(Boolean(res.isLive));
      }
    } catch (e) {
      console.warn('Auth verification check failed, retaining session state.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      setToken(result.token);
      setUser(result.user);
      setIsBackendLive(Boolean(result.isLive));
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    setIsBackendLive(false);
  };

  const refreshToken = async () => {
    try {
      const res = await authService.refreshToken();
      if (res.token) {
        setToken(res.token);
      }
      return res;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token || user),
    isBackendLive,
    loading,
    login,
    logout,
    refreshToken,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
