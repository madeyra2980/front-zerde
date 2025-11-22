const API_BASE_URL = 'http://localhost:8080';

// Вспомогательные функции
const getCleanToken = () => {
  const raw = localStorage.getItem('accessToken');
  if (!raw) return null;

  let cleaned = String(raw).trim().replace(/\r|\n/g, '');
  cleaned = cleaned.replace(/^"|"$/g, '');

  if (cleaned.toLowerCase().startsWith('bearer ')) {
    cleaned = cleaned.slice(7).trim();
  }

  const jwtLike = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  if (!jwtLike.test(cleaned)) {
    return null;
  }

  return cleaned;
};

const logout = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/signin';
};

const validateToken = () => {
  try {
    const token = getCleanToken();
    if (!token) return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

// Основная функция запроса
const request = async (endpoint, options = {}) => {
  let url;
  try {
    url = new URL(endpoint, API_BASE_URL).toString();
  } catch (e) {
    throw new SyntaxError('Некорректный URL для запроса');
  }

  const config = {
    method: options.method || 'GET',
    headers: {
      ...(options.method !== 'DELETE' ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  };

  // Очистка заголовков
  if (config.headers) {
    Object.keys(config.headers).forEach((key) => {
      const value = config.headers[key];
      if (value === undefined || value === null) {
        delete config.headers[key];
      } else {
        config.headers[key] = String(value).replace(/\r|\n/g, '');
      }
    });
  }

  // Добавление токена
  const token = getCleanToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData = {};
      
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 0) {
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
      }

      if (response.status === 0) {
        throw new Error('CORS error: Сервер не разрешает запросы с этого домена.');
      }

      if (response.status === 401) {
        logout();
        const error = new Error('401 Unauthorized');
        error.status = 401;
        error.data = errorData;
        throw error;
      }

      if (response.status === 403) {
        const errorMessage = errorData.message || errorData.error || 'Доступ запрещен.';
        const error = new Error(`403 Forbidden: ${errorMessage}`);
        error.status = 403;
        error.data = errorData;
        throw error;
      }

      if (response.status === 423) {
        const errorMessage = errorData.message || errorData.error || 'Слот заблокирован';
        const error = new Error(`423 Locked: ${errorMessage}`);
        error.status = 423;
        error.data = errorData;
        throw error;
      }

      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const rawText = await response.text();
      const trimmed = rawText?.trim() || '';
      
      if (trimmed.length === 0) {
        return {};
      }

      try {
        return JSON.parse(trimmed);
      } catch {
        // Попытка извлечь JSON массив
        const startIdx = trimmed.indexOf('[');
        const endIdx = trimmed.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          try {
            return JSON.parse(trimmed.slice(startIdx, endIdx + 1));
          } catch {
            return trimmed;
          }
        }
        return trimmed;
      }
    }

    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API функции
const apiService = {
  // Авторизация
  signup: (userData) => request('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  signin: (credentials) => request('/api/v1/auth/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  validateToken,
  logout,

  // Преподаватели
  getTeachers: () => request('/api/v1/admin/teachers'),

  createTeacher: (teacherData) => request('/api/v1/admin/create-teacher', {
    method: 'POST',
    body: JSON.stringify(teacherData),
  }),

  editTeacher: (teacherId, teacherData) => request(`/api/v1/admin/edit-teacher/${teacherId}`, {
    method: 'PUT',
    body: JSON.stringify(teacherData),
  }),

  deleteTeacher: (teacherId) => {
    console.log('API deleteTeacher вызван с ID:', teacherId, 'тип:', typeof teacherId);
    const url = `/api/v1/admin/delete-teacher/${teacherId}`;
    console.log('URL запроса:', url);
    return request(url, {
      method: 'DELETE',
    });
  },

  // Предметы
  getSubjects: () => request('/api/v1/admin/subjects'),

  createSubject: (subjectName) => request('/api/v1/admin/create-subject', {
    method: 'POST',
    body: JSON.stringify({ subjectName }),
  }),

  deleteSubject: (subjectId) => request(`/api/v1/admin/delete-subject/${subjectId}`, {
    method: 'DELETE',
  }),

  // Аудитории
  getRooms: () => request('/api/v1/admin/rooms'),

  createRoom: (roomName) => request('/api/v1/admin/create-room', {
    method: 'POST',
    body: JSON.stringify({ roomName }),
  }),

  deleteRoom: (roomId) => request(`/api/v1/admin/delete-room/${roomId}`, {
    method: 'DELETE',
  }),

  // Группы
  getGroups: () => request('/api/v1/admin/groups'),

  createGroup: (groupName) => request('/api/v1/admin/create-group', {
    method: 'POST',
    body: JSON.stringify({ groupName }),
  }),

  deleteGroup: (groupId) => request(`/api/v1/admin/delete-group/${groupId}`, {
    method: 'DELETE',
  }),

  // Уроки
  createLesson: (lessonData) => request('/api/v1/admin/create-lesson', {
    method: 'POST',
    body: JSON.stringify(lessonData),
  }),

  deleteLesson: (lessonId) => request(`/api/v1/admin/delete-lesson/${lessonId}`, {
    method: 'DELETE',
  }),

  // Блокировка слотов
  createLockedSlot: (lockData) => request('/api/v1/admin/lock-lesson', {
    method: 'POST',
    body: JSON.stringify(lockData),
  }),

  getLockedSlots: () => request('/api/v1/admin/lock-lesson'),

  deleteLockedSlot: (deleteId) => request(`/api/v1/admin/lock-lesson/${deleteId}`, {
    method: 'DELETE',
  }),

  // Дети
  getChildren: () => request('/api/v1/admin/children'),

  createChild: (childData) => request('/api/v1/admin/create-child', {
    method: 'POST',
    body: JSON.stringify(childData),
  }),

  editChild: (childId, childData) => request(`/api/v1/admin/edit_child/${childId}`, {
    method: 'PUT',
    body: JSON.stringify(childData),
  }),

  deleteChild: (childId) => request(`/api/v1/admin/delete-child/${childId}`, {
    method: 'DELETE',
  }),
};

// Экспорт для отладки (только в development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.apiService = apiService;
}

export default apiService;
