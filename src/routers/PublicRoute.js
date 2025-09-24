import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Если пользователь авторизован, перенаправляем на указанную страницу
  if (isAuthenticated) {
    // Сохраняем путь, с которого пришел пользователь, для редиректа после входа
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
