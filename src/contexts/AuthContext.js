import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../service/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Инициализация авторизации при загрузке приложения
    const initAuth = async () => {
      setLoading(true);
      await authService.init();
      setLoading(false);
    };

    initAuth();

    // Подписка на изменения состояния авторизации
    const unsubscribe = authService.subscribe(({ isAuthenticated, user }) => {
      setIsAuthenticated(isAuthenticated);
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const signup = async (userData) => {
    setLoading(true);
    const result = await authService.signup(userData);
    setLoading(false);
    return result;
  };

  const signin = async (credentials) => {
    setLoading(true);
    const result = await authService.signin(credentials);
    setLoading(false);
    return result;
  };

  const logout = () => {
    authService.logout();
  };

  const refreshToken = async () => {
    return await authService.refreshToken();
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    signup,
    signin,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
