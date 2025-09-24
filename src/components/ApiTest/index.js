import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ApiTest.css';

const ApiTest = () => {
  const { isAuthenticated, user, signin, signup, logout } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { 
      id: Date.now(), 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testSignup = async () => {
    setLoading(true);
    addResult('🔄 Тестирование регистрации...', 'info');
    
    try {
      const result = await signup({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      });
      
      if (result.success) {
        addResult('✅ Регистрация успешна!', 'success');
      } else {
        addResult(`❌ Ошибка регистрации: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Исключение при регистрации: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testSignin = async () => {
    setLoading(true);
    addResult('🔄 Тестирование входа...', 'info');
    
    try {
      const result = await signin({
        email: 'admin@gmail.com',
        password: 'admin'
      });
      
      if (result.success) {
        addResult('✅ Вход успешен!', 'success');
        addResult(`👤 Пользователь: ${result.data.user?.email || 'N/A'}`, 'info');
      } else {
        addResult(`❌ Ошибка входа: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Исключение при входе: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testApiCall = async () => {
    setLoading(true);
    addResult('🔄 Тестирование защищенного API...', 'info');
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/lessons', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('✅ API вызов успешен!', 'success');
        addResult(`📊 Получено уроков: ${data.length}`, 'info');
      } else if (response.status === 401) {
        addResult('🔄 Получена 401 ошибка - рефреш токен должен сработать автоматически', 'warning');
      } else {
        addResult(`❌ API ошибка: ${response.status}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Ошибка API: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getTokenInfo = () => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token) return 'Нет токена';
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expDate = new Date(payload.exp * 1000);
      const isExpired = payload.exp < Date.now() / 1000;
      
      return {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        expiresAt: expDate.toLocaleString(),
        isExpired,
        userId: payload.sub || payload.userId || 'N/A'
      };
    } catch (error) {
      return 'Ошибка декодирования токена';
    }
  };

  const tokenInfo = getTokenInfo();

  return (
    <div className="api-test">
      <h2>Тест интеграции с Backend</h2>
      
      <div className="api-test__info">
        <h3>Статус авторизации</h3>
        <p><strong>Авторизован:</strong> {isAuthenticated ? 'Да' : 'Нет'}</p>
        <p><strong>Пользователь:</strong> {user?.email || 'N/A'}</p>
        
        <h3>Информация о токенах</h3>
        {typeof tokenInfo === 'object' ? (
          <>
            <p><strong>Access Token:</strong> {tokenInfo.hasToken ? 'Есть' : 'Нет'}</p>
            <p><strong>Refresh Token:</strong> {tokenInfo.hasRefreshToken ? 'Есть' : 'Нет'}</p>
            <p><strong>Истекает:</strong> {tokenInfo.expiresAt}</p>
            <p><strong>Истек:</strong> {tokenInfo.isExpired ? 'Да' : 'Нет'}</p>
            <p><strong>User ID:</strong> {tokenInfo.userId}</p>
          </>
        ) : (
          <p>{tokenInfo}</p>
        )}
      </div>

      <div className="api-test__controls">
        <button 
          onClick={testSignup} 
          disabled={loading}
          className="api-test__button api-test__button--primary"
        >
          {loading ? 'Тестирование...' : 'Тест Регистрации'}
        </button>
        
        <button 
          onClick={testSignin} 
          disabled={loading}
          className="api-test__button api-test__button--secondary"
        >
          {loading ? 'Тестирование...' : 'Тест Входа (Admin)'}
        </button>
        
        <button 
          onClick={testApiCall} 
          disabled={loading || !isAuthenticated}
          className="api-test__button api-test__button--success"
        >
          {loading ? 'Тестирование...' : 'Тест API (Admin)'}
        </button>
        
        <button 
          onClick={logout} 
          className="api-test__button api-test__button--danger"
        >
          Выйти
        </button>
        
        <button 
          onClick={clearResults} 
          className="api-test__button api-test__button--warning"
        >
          Очистить Результаты
        </button>
      </div>

      <div className="api-test__results">
        <h3>Результаты тестов</h3>
        {testResults.length === 0 ? (
          <p>Результаты тестов появятся здесь</p>
        ) : (
          <div className="api-test__results-list">
            {testResults.map(result => (
              <div key={result.id} className={`api-test__result api-test__result--${result.type}`}>
                <span className="api-test__result-time">[{result.timestamp}]</span>
                <span className="api-test__result-message">{result.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest;
