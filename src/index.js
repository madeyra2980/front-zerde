import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import authService from './service/auth';
import apiService from './service/api';

// Инициализация авторизации при загрузке приложения
authService.init();

// Добавляем apiService в глобальную область видимости для отладки (только в development)
if (process.env.NODE_ENV === 'development') {
  window.apiService = apiService;
  console.log('🔧 apiService доступен глобально для отладки');
  console.log('Используйте: apiService.diagnoseToken()');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

