import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import './RouteGuard.css';

const RouteGuard = ({ 
  children, 
  requiredRole = null,
  requiredPermissions = [],
  fallback = null,
  redirectTo = '/dashboard',
  showAccessDenied = true
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading during permission check
  if (loading) {
    return (
      <div className="route-guard-loading">
        <div>Проверка прав доступа...</div>
      </div>
    );
  }

  // Redirect to signin if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check required role
  if (requiredRole && user?.role !== requiredRole) {
    if (fallback) {
      return fallback;
    }
    
    if (showAccessDenied) {
      return (
        <div className="access-denied-container">
          <Card className="access-denied-card">
            <h2>Доступ запрещен</h2>
            <p>У вас нет прав для доступа к этой странице.</p>
            <p>Требуемая роль: <strong>{requiredRole}</strong></p>
            <p>Ваша роль: <strong>{user?.role || 'Не определена'}</strong></p>
            <button 
              onClick={() => window.history.back()}
              className="back-button"
            >
              Назад
            </button>
          </Card>
        </div>
      );
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const userPermissions = user?.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      if (fallback) {
        return fallback;
      }
      
      if (showAccessDenied) {
        return (
          <div className="access-denied-container">
            <Card className="access-denied-card">
              <h2>Недостаточно прав</h2>
              <p>У вас нет необходимых разрешений для доступа к этой странице.</p>
              <p>Требуемые разрешения:</p>
              <ul>
                {requiredPermissions.map(permission => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
              <button 
                onClick={() => window.history.back()}
                className="back-button"
              >
                Назад
              </button>
            </Card>
          </div>
        );
      }
      
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Render children if all checks pass
  return children;
};

export default RouteGuard;
