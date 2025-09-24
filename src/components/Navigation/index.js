import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { 
  FaHome, 
  FaBook, 
  FaCalendarAlt, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaCog,
  FaSignOutAlt,
  FaGraduationCap
} from 'react-icons/fa';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'Главная', icon: FaHome },
    { path: '/lessons', label: 'Занятия', icon: FaBook },
    { path: '/schedule', label: 'Расписание', icon: FaCalendarAlt },
    { path: '/students', label: 'Дети', icon: FaUsers },
    { path: '/teachers', label: 'Логопеды', icon: FaChalkboardTeacher },
    { path: '/api-test', label: 'Тест API', icon: FaCog },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="navigation__container">
        <div className="navigation__brand">
          <Link to="/dashboard" className="navigation__logo">
            <FaGraduationCap className="navigation__logo-icon" />
            <span className="navigation__logo-text">Zerde</span>
          </Link>
        </div>

        <div className="navigation__menu">
          <ul className="navigation__list">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className="navigation__item">
                  <Link
                    to={item.path}
                    className={`navigation__link ${isActive(item.path) ? 'navigation__link--active' : ''}`}
                  >
                    <IconComponent className="navigation__icon" />
                    <span className="navigation__text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="navigation__user">
          <div className="navigation__user-info">
            <span className="navigation__user-name">{user?.name || 'Пользователь'}</span>
            <span className="navigation__user-email">{user?.email}</span>
          </div>
          <Button
            onClick={handleLogout}
            className="navigation__logout"
            variant="outline"
            size="sm"
          >
            <FaSignOutAlt className="navigation__logout-icon" />
            Выйти
          </Button>
        </div>

        <button
          className="navigation__mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="navigation__hamburger"></span>
          <span className="navigation__hamburger"></span>
          <span className="navigation__hamburger"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navigation__mobile-menu">
          <ul className="navigation__mobile-list">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className="navigation__mobile-item">
                  <Link
                    to={item.path}
                    className={`navigation__mobile-link ${isActive(item.path) ? 'navigation__mobile-link--active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="navigation__mobile-icon" />
                    <span className="navigation__mobile-text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li className="navigation__mobile-item">
              <button
                onClick={handleLogout}
                className="navigation__mobile-logout"
              >
                <FaSignOutAlt className="navigation__mobile-icon" />
                <span className="navigation__mobile-text">Выйти</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
