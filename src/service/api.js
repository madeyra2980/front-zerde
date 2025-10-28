
const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Нормализация токена: возвращаем только валидный JWT без префикса Bearer
  getCleanToken() {
    const raw = localStorage.getItem('accessToken');
    if (!raw) return null;

    // Приводим к строке, убираем переносы/пробелы по краям
    let cleaned = String(raw).trim().replace(/\r|\n/g, '');

    // Убираем обрамляющие кавычки, если токен сохранён как JSON-строка
    cleaned = cleaned.replace(/^"|"$/g, '');

    // Убираем возможный префикс Bearer
    if (cleaned.toLowerCase().startsWith('bearer ')) {
      cleaned = cleaned.slice(7).trim();
    }

    // Разрешаем только корректный по форме JWT, иначе не отправляем вовсе
    const jwtLike = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    if (!jwtLike.test(cleaned)) {
      return null;
    }

    return cleaned;
  }

  logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/signin';
  }

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; 
    }
  }

  async request(endpoint, options = {}) {
    let url;
    try {
      url = new URL(endpoint, API_BASE_URL).toString();
    } catch (e) {
      console.error('API: Некорректный endpoint или базовый URL', { API_BASE_URL, endpoint, error: e?.message });
      throw new SyntaxError('Некорректный URL для запроса');
    }

    const config = {
      headers: {
        ...(options.method !== 'DELETE' ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (config && config.headers && typeof config.headers === 'object') {
      Object.keys(config.headers).forEach((key) => {
        const value = config.headers[key];
        if (value === undefined || value === null) {
          delete config.headers[key];
          return;
        }
        const stringValue = String(value).replace(/\r|\n/g, '');
        config.headers[key] = stringValue;
      });
    }

    if (!config.method) {
      config.method = 'GET';
    }

    let token = this.getCleanToken();
    console.log('API Request - Token:', token ? 'Present' : 'Missing');
  if (token) {
    // Прикрепляем Bearer токен к каждому запросу
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request - Authorization header set');
    
    // Декодируем токен для диагностики (только для PUT/DELETE запросов)
    if (config.method === 'PUT' || config.method === 'DELETE') {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('API Request - Token Payload:', payload);
          console.log('API Request - Roles:', payload.authorities || payload.roles);
        }
      } catch (e) {
        console.log('API Request - Could not decode token');
      }
    }
  } else {
    console.log('API Request - No token, request will be unauthorized');
  }

    try {
      console.log('API: Отправляем запрос:', { url, method: config.method, headers: config.headers });
      console.log('API: Authorization header:', config.headers.Authorization);
      console.log('API: Request config:', {
        url,
        method: config.method,
        headers: config.headers,
        body: config.body ? config.body.substring(0, 200) : 'no body'
      });
      
      const response = await fetch(url, config);
      console.log('API: Получен ответ:', { status: response.status, statusText: response.statusText, url: response.url });
      console.log('API: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const contentLength = response.headers.get('content-length');
        
        let errorData = {};
        
        // Пытаемся парсить JSON только если есть контент
        if (contentLength && parseInt(contentLength) > 0) {
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.log('API: Не удалось распарсить JSON ошибки:', jsonError);
            errorData = {};
          }
        } else {
          console.log('API: Пустое тело ответа, пропускаем парсинг JSON');
        }
        
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
        
        // Если токен истек (401) — перенаправляем на страницу входа
        if (response.status === 401) {
          this.logout();
          throw new Error('401 Unauthorized');
        }
        
        // Если нет доступа (403) — проверяем, есть ли сообщение об ошибке
        if (response.status === 403) {
          console.log('API: Ошибка 403 - Доступ запрещен. Детали ошибки:', errorData);
          const errorMessage = errorData.message || errorData.error || 'Доступ запрещен. Возможно, у вас недостаточно прав доступа.';
          throw new Error(`403 Forbidden: ${errorMessage}`);
        }
        
        // Специальная обработка для ошибки 423 (Locked)
        if (response.status === 423) {
          console.log('API: Ошибка 423 - Слот заблокирован. Детали ошибки:', errorData);
          const errorMessage = errorData.message || errorData.error || 'Слот заблокирован';
          throw new Error(`423 Locked: ${errorMessage}`);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Проверяем Content-Type ответа
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        // Некоторые бэкенды могут возвращать пустое тело с типом JSON — обрабатываем безопасно
        const rawText = await response.text();
        const trimmed = rawText?.trim?.() || '';
        if (trimmed.length === 0) {
          console.log('API: Пустой JSON-ответ, возвращаем {}');
          return {};
        }
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          // Попытка 2: извлечь первый сбалансированный JSON-массив [ ... ] с учётом строк и экранирования
          const extractFirstJsonArray = (text) => {
            let inString = false;
            let escape = false;
            let depth = 0;
            let start = -1;
            for (let i = 0; i < text.length; i++) {
              const ch = text[i];
              if (escape) { escape = false; continue; }
              if (ch === '\\') { escape = true; continue; }
              if (ch === '"') { inString = !inString; continue; }
              if (inString) continue;
              if (ch === '[') { if (depth === 0) start = i; depth++; continue; }
              if (ch === ']') { depth--; if (depth === 0 && start !== -1) { return text.slice(start, i + 1); } }
            }
            return null;
          };
          const balanced = extractFirstJsonArray(trimmed);
          if (balanced) {
            try {
              const parsedArray = JSON.parse(balanced);
              console.warn('API: Используем извлечённый сбалансированный JSON-массив.');
              return parsedArray;
            } catch (_) { /* fallthrough */ }
          }
          // Попытка 3: простая обрезка между первой '[' и последней ']'
          const startIdx = trimmed.indexOf('[');
          const endIdx = trimmed.lastIndexOf(']');
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const possibleArray = trimmed.slice(startIdx, endIdx + 1);
            try {
              const parsedArray = JSON.parse(possibleArray);
              console.warn('API: Исходный JSON был "грязный". Используем грубую обрезку массива.');
              return parsedArray;
            } catch (_) { /* fallthrough */ }
          }
          console.warn('API: Некорректный JSON, возвращаем исходный текст', { error: e?.message, rawText: trimmed.slice(0, 200) });
          return trimmed;
        }
      } else {
        // Если ответ не JSON, возвращаем текст
        const text = await response.text();
        console.log('Non-JSON response:', text);
        return text;
      }
    } catch (error) {
      console.error('API request failed:', error);
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

  async validateToken() {
    try {
      const token = this.getCleanToken();
      if (!token) return false;
      
      // Проверяем, не истек ли токен
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp < Date.now() / 1000;
      
      if (isExpired) return false;
      
      return true;
    } catch (error) {
      console.error('API: Ошибка проверки токена:', error);
      return false;
    }
  }


  resetAuth() {
    console.log('=== СБРОС АВТОРИЗАЦИИ ===');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    console.log('Все токены удалены');
    window.location.href = '/signin';
  } 

  // Диагностика токена
  diagnoseToken() {
    console.log('=== ДИАГНОСТИКА ТОКЕНА ===');
    const rawToken = localStorage.getItem('accessToken');
    console.log('Raw token from localStorage:', rawToken);
    
    if (!rawToken) {
      console.log('❌ Токен отсутствует в localStorage');
      return false;
    }
    
    const cleanToken = this.getCleanToken();
    console.log('Clean token:', cleanToken ? 'Present' : 'Missing');
    
    if (!cleanToken) {
      console.log('❌ Токен не прошел валидацию');
      return false;
    }
    
    try {
      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
        console.log('❌ Токен не имеет правильной структуры JWT');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      const isExpired = payload.exp < Date.now() / 1000;
      console.log('Token expired:', isExpired);
      
      if (isExpired) {
        console.log('❌ Токен истек');
        return false;
      }
      
      console.log('✅ Токен валиден');
      return true;
    } catch (error) {
      console.log('❌ Ошибка при проверке токена:', error);
      return false;
    }
  }

  // Функции для отладки (доступны глобально)
  debug = {
    // Получить текущий токен
    getToken: () => {
      console.log('Текущий токен:', localStorage.getItem('accessToken'));
      return localStorage.getItem('accessToken');
    },
    
    // Очистить токен
    clearToken: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      console.log('Токен очищен');
    },
    
    // Проверить токен
    checkToken: () => this.diagnoseToken(),
    
    // Проверить роли в токене
    checkRoles: () => {
      console.log('=== ПРОВЕРКА РОЛЕЙ В ТОКЕНЕ ===');
      try {
        const token = this.getCleanToken();
        if (!token) {
          console.log('❌ Токен отсутствует');
          return null;
        }
        
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.log('❌ Неверный формат токена');
          return null;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        console.log('Полный payload токена:', payload);
        
        const roles = payload.authorities || payload.roles || [];
        console.log('Роли пользователя:', roles);
        
        const hasAdminRole = Array.isArray(roles) 
          ? roles.some(r => (typeof r === 'string' ? r : r.authority)?.includes('ADMIN'))
          : false;
          
        console.log('Есть ли роль ADMIN:', hasAdminRole);
        
        if (!hasAdminRole) {
          console.warn('⚠️ У вас нет роли ADMIN! Это может быть причиной ошибки 403');
          console.warn('Доступные роли:', roles);
        } else {
          console.log('✅ Роль ADMIN найдена');
        }
        
        return { payload, roles, hasAdminRole };
      } catch (e) {
        console.error('❌ Ошибка при проверке ролей:', e);
        return null;
      }
    },
    
    // Тест запроса к teachers
    testTeachers: async () => {
      try {
        console.log('Тестируем запрос к /api/v1/admin/teachers...');
        const result = await this.getTeachers();
        console.log('✅ Успешно:', result);
        return result;
      } catch (error) {
        console.error('❌ Ошибка:', error.message);
        throw error;
      }
    }
  };

  // Создание преподавателя
  async createTeacher(teacherData) {
    
    this.diagnoseToken();
    
    try {
      await this.getTeachers();
      console.log('API: ✅ getTeachers работает для диагностики');
    } catch (error) {
      if (error.message.includes('403')) {
        console.error('API: Проблема с правами доступа на уровне всех админских эндпоинтов');
        console.error('API: Это означает, что проблема не в конкретном эндпоинте create-teacher, а в общих правах доступа');
        
        // Не прерываем выполнение, а пробуем создать преподавателя все равно
        console.log('API: Продолжаем попытку создания преподавателя несмотря на ошибки других эндпоинтов...');
      }
    }
    
    try {
      console.log('API: Тестируем getSubjects...');
      const subjects = await this.getSubjects();
      console.log('API: ✅ getSubjects работает, получено предметов:', subjects?.length || 0);
    } catch (error) {
      console.error('API: ❌ getSubjects не работает:', error.message);
    }
    
    // Попробуем разные варианты запроса
    console.log('API: Пытаемся создать преподавателя...');
    
    try {
      // Вариант 1: Стандартный запрос
      console.log('API: Вариант 1 - стандартный запрос');
      const result = await this.request('/api/v1/admin/create-teacher', {
        method: 'POST',
        body: JSON.stringify(teacherData),
      });
      console.log('API: ✅ Преподаватель успешно создан (стандартный запрос):', result);
      return result;
    } catch (error) {
      console.error('API: ❌ Стандартный запрос не сработал:', error.message);
      
      if (error.message.includes('403')) {
        console.log('API: Пробуем альтернативные варианты...');
        
        try {
          // Вариант 2: Запрос с дополнительными заголовками
          console.log('API: Вариант 2 - с дополнительными заголовками');
          const cleanToken = this.getCleanToken();
          const result = await this.request('/api/v1/admin/create-teacher', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanToken}`,
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(teacherData),
          });
          console.log('API: ✅ Преподаватель успешно создан (с заголовками):', result);
          return result;
        } catch (secondError) {
          console.error('API: ❌ Вариант с заголовками не сработал:', secondError.message);
          
          try {
            // Вариант 3: Попробуем другой путь
            console.log('API: Вариант 3 - альтернативный путь');
            const result = await this.request('/api/v1/admin/teachers', {
              method: 'POST',
              body: JSON.stringify(teacherData),
            });
            console.log('API: ✅ Преподаватель успешно создан (альтернативный путь):', result);
            return result;
          } catch (thirdError) {
            console.error('API: ❌ Альтернативный путь не сработал:', thirdError.message);
            throw error; // Бросаем оригинальную ошибку
          }
        }
      } else {
        // Дополнительная диагностика для других ошибок
        console.error('API: Ошибка создания преподавателя (не 403):', error.message);
        throw error;
      }
    }
  }

  async editTeacher(teacherId, teacherData) {

    
    // Диагностика токена
    this.diagnoseToken();
    
    // Попробуем разные варианты эндпоинтов
    const endpoints = [
      `/api/v1/admin/edit_teacher/${teacherId}`,
      `/api/v1/admin/edit-teacher/${teacherId}`,
      `/api/v1/admin/teachers/${teacherId}`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Пробуем эндпоинт: ${endpoint}`);
        const result = await this.request(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(teacherData),
        });
        console.log('API: Преподаватель успешно отредактирован:', result);
        return result;
      } catch (error) {
        console.log(`Эндпоинт ${endpoint} не сработал:`, error.message);
        lastError = error;
      }
    }
    
    // Если все варианты не сработали, бросаем последнюю ошибку
    throw lastError;
  }

  async deleteTeacher(teacherId) {
    console.log('=== УДАЛЕНИЕ ПРЕПОДАВАТЕЛЯ ===');
    console.log('Teacher ID:', teacherId);
    
    // Диагностика токена
    this.diagnoseToken();
    
    // Попробуем разные варианты эндпоинтов
    const endpoints = [
      `/api/v1/admin/delete-teacher/${teacherId}`,
      `/api/v1/admin/delete_teacher/${teacherId}`,
      `/api/v1/admin/teachers/${teacherId}`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Пробуем эндпоинт: ${endpoint}`);
        const result = await this.request(endpoint, {
          method: 'DELETE',
        });
        console.log('API: Преподаватель успешно удален:', result);
        return result;
      } catch (error) {
        console.log(`Эндпоинт ${endpoint} не сработал:`, error.message);
        lastError = error;
      }
    }
    
    // Если все варианты не сработали, бросаем последнюю ошибку
    throw lastError;
  }

  // Получение списка преподавателей
  async getTeachers() {
    console.log('API: Запрашиваем список преподавателей...');
    
    // Диагностируем токен перед запросом
    this.diagnoseToken();
    
    // Проверяем роли в токене
    try {
      const token = this.getCleanToken();
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('API: Роли в токене:', payload.authorities || payload.roles || 'Роли не найдены');
          console.log('API: Полный payload токена:', payload);
        }
      }
    } catch (e) {
      console.error('API: Ошибка проверки ролей:', e);
    }
    
    // Попробуем несколько вариантов эндпоинтов
    const endpoints = [
      '/api/v1/admin/teachers',
      '/api/v1/teachers',
      '/api/v1/admin/teacher'
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`API: Пробуем эндпоинт: ${endpoint}`);
        const result = await this.request(endpoint);
        console.log('API: ✅ Успешно получены данные с:', endpoint);
        return result;
      } catch (error) {
        console.log(`API: ❌ Эндпоинт ${endpoint} не сработал:`, error.message);
        lastError = error;
      }
    }
    
    // Если все варианты не сработали, бросаем последнюю ошибку
    throw lastError;
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

  async deleteSubject(subjectId) {
    console.log('=== УДАЛЕНИЕ ПРЕДМЕТА ===');
    console.log('Subject ID:', subjectId);
    console.log('Токен:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    
    // Диагностика токена
    this.diagnoseToken();
    
    try {
      const result = await this.request(`/api/v1/admin/delete-subject/${subjectId}`, {
        method: 'DELETE',
      });
      console.log('API: Предмет успешно удален:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка удаления предмета:', error);
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

  async deleteRoom(roomId) {
    console.log('=== УДАЛЕНИЕ АУДИТОРИИ ===');
    console.log('Room ID:', roomId);
    console.log('Токен:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    
    // Диагностика токена
    this.diagnoseToken();
    
    try {
      const result = await this.request(`/api/v1/admin/delete-room/${roomId}`, {
        method: 'DELETE',
      });
      console.log('API: Аудитория успешно удалена:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка удаления аудитории:', error);
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

  async deleteGroup(groupId) {
    console.log('=== УДАЛЕНИЕ ГРУППЫ ===');
    console.log('Group ID:', groupId);
    console.log('Токен:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    
    // Диагностика токена
    this.diagnoseToken();
    
    try {
      const result = await this.request(`/api/v1/admin/delete-group/${groupId}`, {
        method: 'DELETE',
      });
      console.log('API: Группа успешно удалена:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка удаления группы:', error);
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
      console.log('API: Урок успешно создан:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка создания урока:', error);
      console.error('API: Токен после ошибки:', localStorage.getItem('accessToken'));
      throw error;
    }
  }

  async deleteLesson(lessonId) {
    console.log('API: Удаляем урок с ID:', lessonId);
    try {
      const result = await this.request(`/api/v1/admin/delete-lesson/${lessonId}`, {
        method: 'DELETE',
      });
      console.log('API: Урок успешно удален:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка удаления урока:', error);
      throw error;
    }
  }

  // === БЛОКИРОВКА СЛОТОВ ===
  async createLockedSlot(lockData) {
    console.log('API: Создание блокировки слота с данными:', lockData);
    console.log('API: Типы данных:', {
      lockDateTimeFrom: typeof lockData.lockDateTimeFrom,
      lockDateTimeTo: typeof lockData.lockDateTimeTo,
      roomName: typeof lockData.roomName
    });
    
    try {
      const requestBody = JSON.stringify(lockData);
      console.log('API: Отправляем JSON:', requestBody);
      
      const result = await this.request('/api/v1/admin/lock-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      console.log('API: Блокировка слота успешно создана:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка создания блокировки слота:', error);
      console.error('API: Детали ошибки:', {
        message: error.message,
        stack: error.stack
      });
      
      // Специальная обработка для ошибки 423
      if (error.message.includes('423')) {
        // Извлекаем детальное сообщение из ошибки
        const detailMessage = error.message.replace('423 Locked: ', '');
        throw new Error(`Слот заблокирован: ${detailMessage}`);
      }
      
      // Специальная обработка для ошибки 403
      if (error.message.includes('403')) {
        // Извлекаем детальное сообщение из ошибки
        const detailMessage = error.message.replace('403 Forbidden: ', '');
        throw new Error(`Доступ запрещен: ${detailMessage}. Возможно, у вас недостаточно прав для блокировки слотов.`);
      }
      
      throw error;
    }
  }

  async getLockedSlots() {
    console.log('API: Запрашиваем список заблокированных слотов...');
    const result = await this.request('/api/v1/admin/lock-lesson');
    console.log('API: Получен ответ заблокированных слотов:', result);
    return result;
  }

  async deleteLockedSlot(deleteId) {
    console.log('=== УДАЛЕНИЕ ЗАБЛОКИРОВАННОГО СЛОТА ===');
    console.log('Lock Lesson ID:', deleteId);
    console.log('Токен:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    
    // Диагностика токена
    this.diagnoseToken();
    
    try {
      // ПРАВИЛЬНЫЙ эндпоинт для заблокированных слотов
      const result = await this.request(`/api/v1/admin/lock-lesson/${deleteId}`, {
        method: 'DELETE',
      });
      console.log('API: Заблокированный слот успешно удален:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка удаления заблокированного слота:', error);
      throw error;
    }
  }

  // === CHILDREN ===
  async getChildren() {
    console.log('API: Запрашиваем список детей...');
    const result = await this.request('/api/v1/admin/children');
    console.log('API: Получен ответ детей:', result);
    return result;
  }

  async createChild(childData) {
    console.log('API: Создаем ребенка:', childData);
    try {
      const result = await this.request('/api/v1/admin/create-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });
      console.log('API: Ребенок успешно создан:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка создания ребенка:', error);
      throw error;
    }
  }

  async editChild(childId, childData) {
    console.log('API: Редактируем ребенка с ID:', childId);
    try {
      const result = await this.request(`/api/v1/admin/edit_child/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });
      console.log('API: Ребенок успешно отредактирован:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка редактирования ребенка:', error);
      throw error;
    }
  }

  async deleteChild(childId) {
    console.log('API: Удаляем ребенка с ID:', childId);
    try {
      const result = await this.request(`/api/v1/admin/delete-child/${childId}`, {
        method: 'DELETE',
      });
      console.log('API: Ребенок успешно удален:', result);
      return result;
    } catch (error) {
      console.error('API: Ошибка удаления ребенка:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();



export default apiService;

// Экспорт для отладки из консоли браузера
try {
  if (typeof window !== 'undefined') {
    window.apiService = apiService;
  }
} catch (_) {}