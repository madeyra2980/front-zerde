import apiService from './api.js';

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Уведомление всех подписчиков об изменениях
  notify() {
    this.listeners.forEach(listener => listener({
      isAuthenticated: this.isAuthenticated,
      user: this.user
    }));
  }

  // Инициализация - проверяем токен при загрузке приложения
  async init() {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const isValid = await apiService.validateToken();
        if (isValid) {
          this.isAuthenticated = true;
          this.user = JSON.parse(localStorage.getItem('user') || '{}');
        } else {
          this.logout();
        }
      }
      this.notify();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.logout();
    }
  }

  // Регистрация
  async signup(userData) {
    try {
      const response = await apiService.signup(userData);
      
      if (response.token) {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user || userData));
        
        this.isAuthenticated = true;
        this.user = response.user || userData;
        this.notify();
        
        return { success: true, data: response };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Вход
  async signin(credentials) {
    try {
      const response = await apiService.signin(credentials);
      
      if (response.token) {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user || { email: credentials.email }));
        
        this.isAuthenticated = true;
        this.user = response.user || { email: credentials.email };
        
        console.log('Авторизация успешна. Пользователь:', this.user);
        this.notify();
        
        return { success: true, data: response };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Выход
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.user = null;
    this.notify();
  }

  // Получение текущего пользователя
  getCurrentUser() {
    return this.user;
  }

  // Проверка авторизации
  isLoggedIn() {
    return this.isAuthenticated;
  }

  // Получение токена
  getToken() {
    return localStorage.getItem('accessToken');
  }
}

export default new AuthService();
