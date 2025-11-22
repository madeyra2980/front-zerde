import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../ui';
import './ProtectedRoute.css';

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/signin',
  requireAuth = true,
  fallback = null 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loading />
      </div>
    );
  }

  // Redirect to signin if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Redirect to dashboard if authentication is not required but user is authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show fallback if provided and user is not authenticated
  if (!isAuthenticated && fallback) {
    return fallback;
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;
