import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { MOCK_USERS } from '../services/authService';
import { USE_MOCK } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setUser(storedUser);
    } else if (USE_MOCK) {
      // Default to student demo user only in mock mode
      const defaultUser = MOCK_USERS.student;
      localStorage.setItem('skillbridge_user', JSON.stringify(defaultUser));
      localStorage.setItem('skillbridge_token', `sb_mock_jwt_student_init`);
      setUser(defaultUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const enriched = authService.getCurrentUser() || res.data.user;
      setUser(enriched);
      return enriched;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (personaRole) => {
    setLoading(true);
    try {
      const res = await authService.demoLogin(personaRole);
      const enriched = authService.getCurrentUser() || res.data.user;
      setUser(enriched);
      return enriched;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      const payload = res.data || res;
      if (payload.token && payload.user?.verified !== false) setUser(payload.user);
      else setUser(null);
      return payload;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((current) => {
      const nextUser = { ...current, ...updatedUser };
      localStorage.setItem('skillbridge_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  // Demo role changes must use a real backend session, not a frontend-only token.
  const switchRoleDev = demoLogin;

  const value = {
    user,
    role: user?.role || 'student',
    isAuthenticated: Boolean(user),
    loading,
    login,
    demoLogin,
    register,
    logout,
    updateUser,
    switchRoleDev,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

