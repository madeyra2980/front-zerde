import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../ui';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Профиль пользователя</h1>
        <Button onClick={handleLogout} className="logout-button">
          Выйти
        </Button>
      </div>
      
      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          
          <div className="profile-info">
            <h2>{user?.name || 'Пользователь'}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-role">Роль: {user?.role || 'Пользователь'}</p>
          </div>

          <div className="profile-details">
            <h3>Информация о профиле</h3>
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{user?.id || 'Не указан'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Дата регистрации:</span>
              <span className="detail-value">{user?.createdAt || 'Не указана'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Последний вход:</span>
              <span className="detail-value">{user?.lastLogin || 'Не указан'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
