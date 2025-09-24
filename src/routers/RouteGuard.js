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

  // Показываем загрузку во время проверки
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div>Проверка прав доступа...</div>
      </div>
    );
  }

  // Если пользователь не авторизован
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Проверка роли
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

  // Проверка разрешений
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

  // Если все проверки пройдены, показываем дочерние компоненты
  return children;
};

export default RouteGuard;
