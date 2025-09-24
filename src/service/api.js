const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : ''; // В development используем прокси

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Обработка очереди запросов во время рефреша токена
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Проверка срока действия токена
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Если не можем декодировать, считаем токен недействительным
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Добавляем токен в заголовки если он есть
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Специальная обработка CORS ошибок
        if (response.status === 0 || response.status === 403) {
          throw new Error('CORS error: Сервер не разрешает запросы с этого домена. Проверьте настройки CORS на сервере.');
        }
        
        // Если токен истек (401), пытаемся обновить его
        if (response.status === 401 && token && !endpoint.includes('/auth/refresh')) {
          return this.handleTokenRefresh(endpoint, options);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Дополнительная информация для отладки
      if (error.message.includes('CORS')) {
        console.error('CORS Error Details:', {
          url,
          method: config.method || 'GET',
          headers: config.headers,
          body: config.body
        });
      }
      
      throw error;
    }
  }

  // Обработка обновления токена
  async handleTokenRefresh(originalEndpoint, originalOptions) {
    if (this.isRefreshing) {
      // Если уже идет процесс обновления, добавляем запрос в очередь
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(token => {
        return this.makeRequest(originalEndpoint, originalOptions, token);
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.refreshToken(refreshToken);
      
      if (response.token) {
        localStorage.setItem('accessToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        this.processQueue(null, response.token);
        
        // Повторяем оригинальный запрос с новым токеном
        return this.makeRequest(originalEndpoint, originalOptions, response.token);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      this.processQueue(error, null);
      // Если не удалось обновить токен, перенаправляем на страницу входа
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/signin';
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Выполнение запроса с токеном
  async makeRequest(endpoint, options, token) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Авторизация
  async signup(userData) {
    return this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials) {
    return this.request('/api/v1/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken) {
    return this.makeRequest('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token: refreshToken }),
    });
  }

  // Проверка валидности токена
  async validateToken() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;
      
      // Здесь можно добавить эндпоинт для проверки токена
      // Пока что просто проверяем наличие токена
      return true;
    } catch (error) {
      return false;
    }
  }
}

const apiService = new ApiService();
export default apiService;
