const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com'
  : ''; // In development, use proxy

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
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('API Request - Token:', token ? 'Present' : 'Missing');
    console.log('API Request - Refresh Token:', refreshToken ? 'Present' : 'Missing');
    if (token) {
      // Проверяем, не истек ли токен
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        console.log('API Request - Token expires at:', new Date(payload.exp * 1000));
        console.log('API Request - Current time:', new Date(now * 1000));
        console.log('API Request - Token expired:', isExpired);
      } catch (e) {
        console.log('API Request - Could not parse token:', e.message);
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Authorization header set');
    } else {
      console.log('API Request - No token, request will be unauthorized');
    }

    try {
      console.log('API: Отправляем запрос:', { url, method: config.method, headers: config.headers });
      console.log('API: Authorization header:', config.headers.Authorization);
      const response = await fetch(url, config);
      console.log('API: Получен ответ:', { status: response.status, statusText: response.statusText, url: response.url });
      console.log('API: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('API: Ошибка ответа:', { status: response.status, errorData });
        
        // Специальная обработка CORS ошибок (только для статуса 0)
        if (response.status === 0) {
          console.log('API: CORS ошибка, проверяем заголовки ответа');
          console.log('API: CORS заголовки:', {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
          });
          throw new Error('CORS error: Сервер не разрешает запросы с этого домена. Проверьте настройки CORS на сервере.');
        }
        
        // Обработка 403 ошибки (Forbidden) - возможно истек токен
        if (response.status === 403 && token && !endpoint.includes('/auth/refresh')) {
          console.log('API: 403 Forbidden, возможно истек токен, пытаемся обновить...');
          return this.handleTokenRefresh(endpoint, options);
        }
        
        // Если токен истек (401), пытаемся обновить его
        if (response.status === 401 && token && !endpoint.includes('/auth/refresh')) {
          console.log('API: Токен истек, обновляем...');
          return this.handleTokenRefresh(endpoint, options);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Проверяем Content-Type ответа
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Если ответ не JSON, возвращаем текст
        const text = await response.text();
        console.log('Non-JSON response:', text);
        return text;
      }
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
    console.log('API: Начинаем обновление токена для:', originalEndpoint);
    
    if (this.isRefreshing) {
      console.log('API: Токен уже обновляется, добавляем в очередь');
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
      console.log('API: Refresh token:', refreshToken ? 'Present' : 'Missing');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.refreshToken(refreshToken);
      console.log('API: Получен ответ от refresh:', response);
      
      if (response.token) {
        localStorage.setItem('accessToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        console.log('API: Токены обновлены, обрабатываем очередь');
        this.processQueue(null, response.token);
        
        // Повторяем оригинальный запрос с новым токеном
        return this.makeRequest(originalEndpoint, originalOptions, response.token);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('API: Ошибка обновления токена:', error);
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

    // Проверяем Content-Type ответа
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Если ответ не JSON, возвращаем текст
      const text = await response.text();
      console.log('Non-JSON response:', text);
      return text;
    }
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
    console.log('API: Обновляем токен с refresh token:', refreshToken ? 'Present' : 'Missing');
    
    const url = `${this.baseURL}/api/v1/auth/refresh`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        return text;
      }
    } catch (error) {
      console.error('Refresh token request failed:', error);
      throw error;
    }
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

  // Создание преподавателя
  async createTeacher(teacherData) {
    return this.request('/api/v1/admin/create-teacher', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  // Получение списка преподавателей
  async getTeachers() {
    console.log('API: Запрашиваем список преподавателей...');
    const result = await this.request('/api/v1/admin/teachers');
    console.log('API: Получен ответ:', result);
    return result;
  }

  // === ПРЕДМЕТЫ ===
  async getSubjects() {
    console.log('API: Запрашиваем список предметов...');
    const result = await this.request('/api/v1/admin/subjects');
    console.log('API: Получен ответ предметов:', result);
    return result;
  }

  async createSubject(subjectName) {
    console.log('API: Создаем предмет:', subjectName);
    try {
      const result = await this.request('/api/v1/admin/create-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjectName }),
      });
      console.log('API: Предмет создан:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка создания предмета:', error);
      throw error;
    }
  }

  // === АУДИТОРИИ ===
  async getRooms() {
    console.log('API: Запрашиваем список аудиторий...');
    const result = await this.request('/api/v1/admin/rooms');
    console.log('API: Получен ответ аудиторий:', result);
    return result;
  }

  async createRoom(roomName) {
    console.log('API: Создаем аудиторию:', roomName);
    try {
      const result = await this.request('/api/v1/admin/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName }),
      });
      console.log('API: Аудитория создана:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка создания аудитории:', error);
      throw error;
    }
  }

  // === ГРУППЫ ===
  async getGroups() {
    console.log('API: Запрашиваем список групп...');
    const result = await this.request('/api/v1/admin/groups');
    console.log('API: Получен ответ групп:', result);
    return result;
  }

  async createGroup(groupName) {
    console.log('API: Создаем группу:', groupName);
    try {
      const result = await this.request('/api/v1/admin/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName }),
      });
      console.log('API: Группа создана:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка создания группы:', error);
      throw error;
    }
  }

  // === УРОКИ ===
  async createLesson(lessonData) {
    try {
      const result = await this.request('/api/v1/admin/create-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });
      return result;
    } catch (error) {
      console.error('API: Ошибка создания урока:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
