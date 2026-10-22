import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { MOCK_USERS } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check from localStorage or default to student mock for seamless developer evaluation
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      // Default to student demo user so evaluators can instantly view the app
      const defaultUser = MOCK_USERS.student;
      localStorage.setItem('skillbridge_user', JSON.stringify(defaultUser));
      localStorage.setItem('skillbridge_token', `sb_mock_jwt_student_init`);
      setUser(defaultUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Dev-only role switcher to evaluate Student, Placement Coordinator, Career Mentor, Admin seamlessly
  const switchRoleDev = (targetRole) => {
    if (MOCK_USERS[targetRole]) {
      const switchedUser = MOCK_USERS[targetRole];
      localStorage.setItem('skillbridge_user', JSON.stringify(switchedUser));
      localStorage.setItem('skillbridge_token', `sb_mock_jwt_${targetRole}_dev`);
      setUser(switchedUser);
    }
  };

  const value = {
    user,
    role: user?.role || 'student',
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
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

export default AuthContext;
