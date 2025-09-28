import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../ui';

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/signin',
  requireAuth = true,
  fallback = null 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Loading />
      </div>
    );
  }

  // Если требуется авторизация, но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Если не требуется авторизация, но пользователь авторизован
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Если есть fallback и пользователь не авторизован
  if (!isAuthenticated && fallback) {
    return fallback;
  }

  // Если все проверки пройдены, показываем дочерние компоненты
  return children;
};

export default ProtectedRoute;
