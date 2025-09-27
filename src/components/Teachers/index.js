import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Loading, Modal, Table, Badge, Input, Toast, ToastContainer, useToast } from '../ui';
import Navigation from '../Navigation';
import apiService from '../../service/api';
import { useAuth } from '../../contexts/AuthContext';
import './Teachers.css';

const Teachers = () => {
  const { isAuthenticated, user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    lastname: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { info: showToast, toasts, removeToast } = useToast();

  useEffect(() => {
    console.log('=== useEffect вызван ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    fetchTeachers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      console.log('=== fetchTeachers вызван ===');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('user:', user);
      console.log('Загружаем преподавателей...');
      
      // Получаем преподавателей через API преподавателей
      const teachersData = await apiService.getTeachers();
      // Данные получены успешно
      
      // Данные получены успешно
      
      // Преобразуем данные в нужный формат
      const teachersArray = teachersData.map((teacher, index) => {
        // Обрабатываем данные преподавателя
        
        const processedTeacher = {
          id: teacher.id || `teacher_${index}`, // Используем ID из API или создаем уникальный
          name: teacher.name, 
          surname: teacher.surName,
          lastname: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone,
          subjects: teacher.subjects?.map(subject => subject.name) || [],
          authorities: teacher.authorities?.map(auth => auth.authority) || [],
          passwordTemporary: teacher.passwordTemporary || false,
          lessonsCount: 0, // Пока не получаем из API
          studentsCount: 0, // Пока не получаем из API
          lastLesson: null // Пока не получаем из API
        };
        
        // Преподаватель обработан
        return processedTeacher;
      });
      
      // Данные готовы для отображения
      console.log('=== Устанавливаем teachers в состояние ===');
      console.log('teachersArray:', teachersArray);
      setTeachers(teachersArray);
      console.log('=== setTeachers вызван ===');
    } catch (error) {
      console.error('Ошибка загрузки преподавателей:', error);
      showToast(`Ошибка загрузки преподавателей: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateTeacher = () => {
    setFormData({
      name: '',
      surname: '',
      lastname: '',
      email: ''
    });
    setShowCreateModal(true);
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const validateForm = () => {
    const errors = [];
    
    // Проверка обязательных полей
    if (!formData.name.trim()) {
      errors.push('Имя обязательно для заполнения');
    }
    if (!formData.surname.trim()) {
      errors.push('Фамилия обязательна для заполнения');
    }
    if (!formData.email.trim()) {
      errors.push('Email обязателен для заполнения');
    }
    
    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Некорректный формат email');
    }
    
    // Проверка формата имени (только буквы, пробелы, дефисы)
    const nameRegex = /^[а-яёА-ЯЁa-zA-Z\s-]+$/;
    if (formData.name && !nameRegex.test(formData.name)) {
      errors.push('Имя может содержать только буквы, пробелы и дефисы');
    }
    if (formData.surname && !nameRegex.test(formData.surname)) {
      errors.push('Фамилия может содержать только буквы, пробелы и дефисы');
    }
    if (formData.lastname && !nameRegex.test(formData.lastname)) {
      errors.push('Отчество может содержать только буквы, пробелы и дефисы');
    }
    
    return errors;
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showToast(validationErrors.join('. '), 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      // Подготавливаем данные для отправки
      const teacherData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        lastname: formData.lastname.trim() || '',
        email: formData.email.trim().toLowerCase()
      };
      
      console.log('Отправляем данные:', teacherData);
      
      await apiService.createTeacher(teacherData);
      
      showToast('Преподаватель успешно создан!', 'success');
      setShowCreateModal(false);
      fetchTeachers(); // Обновляем список
    } catch (error) {
      console.error('Ошибка создания преподавателя:', error);
      showToast(`Ошибка создания преподавателя: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };




  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  console.log('=== ОТЛАДКА ДАННЫХ ===');
  console.log('teachers:', teachers);
  console.log('teachers.length:', teachers?.length);
  console.log('teachers[0]:', teachers?.[0]);
  
  const filteredTeachers = teachers.filter(teacher => {
    if (!teacher) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.surname?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower) ||
      teacher.subjects?.some(subject => subject.toLowerCase().includes(searchLower))
    );
  });
  
  console.log('filteredTeachers:', filteredTeachers);
  console.log('filteredTeachers.length:', filteredTeachers?.length);
  console.log('filteredTeachers[0]:', filteredTeachers?.[0]);


  const columns = [
    {
      key: 'id',
      title: 'ID',
      width: '80px',
      render: (value, teacher, index) => {
        console.log('RENDER ID - value:', value, 'teacher:', teacher, 'index:', index);
        return teacher?.id || 'Не указано';
      }
    },
    {
      key: 'name',
      title: 'ФИО',
      render: (value, teacher, index) => {
        console.log('RENDER ФИО - value:', value, 'teacher:', teacher, 'index:', index);
        if (!teacher) return 'Не указано';
        const fullName = [teacher.name, teacher.surname, teacher.lastname]
          .filter(Boolean)
          .join(' ');
        console.log('RENDER ФИО - fullName:', fullName);
        return fullName || 'Не указано';
      }
    },
    {
      key: 'email',
      title: 'Email',
      render: (value, teacher, index) => teacher?.email || 'Не указано'
    },
    {
      key: 'phone',
      title: 'Телефон',
      render: (value, teacher, index) => teacher?.phone || 'Не указано' 
    },
    {
      key: 'subjects',
      title: 'Предметы',
      render: (value, teacher, index) => {
        if (!teacher) return <span className="text-muted">Не указаны</span>;
        return (
          <div className="subjects-list">
            {teacher.subjects?.slice(0, 2).map((subject, index) => (
              <Badge key={index} variant="outline" className="subject-badge">
                {subject}
              </Badge>
            ))}
            {teacher.subjects?.length > 2 && (
              <Badge variant="secondary" className="more-subjects">
                +{teacher.subjects.length - 2}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'authorities',
      title: 'Роли',
      render: (value, teacher, index) => {
        if (!teacher) return <span className="text-muted">Не указаны</span>;
        return (
          <div className="authorities-list">
            {teacher.authorities?.length > 0 ? (
              teacher.authorities.map((authority, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {authority}
                </Badge>
              ))
            ) : (
              <span className="text-muted">Не указаны</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'passwordTemporary',
      title: 'Пароль',
      width: '100px',
      render: (value, teacher, index) => {
        if (!teacher) return <span className="text-muted">Не указан</span>;
        return (
          <Badge variant={teacher.passwordTemporary ? 'warning' : 'success'}>
            {teacher.passwordTemporary ? 'Временный' : 'Постоянный'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (value, teacher, index) => {
        if (!teacher) return <span className="text-muted">Нет данных</span>;
        return (
          <div className="teacher-actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(teacher)}
            >
              Подробнее
            </Button>
          </div>
        );
      }
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="teachers">
        <Navigation />
        <div className="teachers-container">
          <div className="loading-container">
            <p>Необходимо авторизоваться для просмотра преподавателей</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="teachers">
        <Navigation />
        <div className="teachers-loading">
          <Loading size="lg" text="Загрузка преподавателей..." />
        </div>
      </div>
    );
  }

  return (
    <div className="teachers">
      <Navigation />
      
      <div className="teachers-container">
       
        
        <div className="teachers-header">
          <div className="teachers-title">
            <h1>Управление преподавателями</h1>
            <p>Добавление, редактирование и просмотр информации о преподавателях</p>
          </div>
          <Button onClick={handleCreateTeacher} >
             Добавить преподавателя 
          </Button>
        </div>

        <div className="teachers-content">
          <Card className="teachers-card">
            <div className="teachers-toolbar">
              <div className="search-container">
                <Input
                  type="text"
                  placeholder="Поиск по имени, email или предмету..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="teachers-stats">
                <div className="stat-item">
                  <span className="stat-number">{teachers.length}</span>
                  <span className="stat-label">Всего преподавателей</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {teachers.filter(t => t.lessonsCount > 0).length}
                  </span>
                  <span className="stat-label">Активных</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {teachers.reduce((acc, t) => acc + t.lessonsCount, 0)}
                  </span>
                  <span className="stat-label">Всего уроков</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {teachers.reduce((acc, t) => acc + t.studentsCount, 0)}
                  </span>
                  <span className="stat-label">Всего студентов</span>
                </div>
              </div>
            </div>

            <Table
              data={filteredTeachers}
              columns={columns}
              className="teachers-table"
            />
          </Card>
        </div>
      </div>
      {/* Модальное окно создания преподавателя */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Добавление нового преподавателя"
        size="lg"
      >
        <form onSubmit={handleSubmitTeacher} className="create-teacher-form">
          <div className="form-group">
            <label>
              Имя 
              <span className="required">*</span>
            </label>
            <Input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Введите имя (только буквы)" 
              pattern="[а-яёА-ЯЁa-zA-Z\s-]+"
              title="Имя может содержать только буквы, пробелы и дефисы"
              required
              size="md"
            />
          </div>
          <div className="form-group">
            <label>
              Фамилия 
              <span className="required">*</span>
            </label>
            <Input 
              type="text" 
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              placeholder="Введите фамилию (только буквы)" 
              pattern="[а-яёА-ЯЁa-zA-Z\s-]+"
              title="Фамилия может содержать только буквы, пробелы и дефисы"
              required
              size="md"
            />
          </div>
          <div className="form-group">
            <label>Отчество</label>
            <Input 
              type="text" 
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              placeholder="Введите отчество (только буквы)" 
              pattern="[а-яёА-ЯЁa-zA-Z\s-]+"
              title="Отчество может содержать только буквы, пробелы и дефисы"
              size="md"
            />
          </div>
          <div className="form-group">
            <label>
              Email 
              <span className="required">*</span>
            </label>
            <Input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@domain.com" 
              required
              size="md"
            />
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модальное окно деталей преподавателя */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Информация о преподавателе"
      >
        {selectedTeacher && (
          <div className="teacher-details">
            <div className="teacher-avatar">
              <div className="avatar-circle">
                {selectedTeacher.name?.[0] || 'П'}
              </div>
            </div>
            
            <div className="detail-row">
              <strong>ID:</strong> {selectedTeacher.id}
            </div>
            <div className="detail-row">
              <strong>ФИО:</strong> {[selectedTeacher.name, selectedTeacher.surname, selectedTeacher.lastname].filter(Boolean).join(' ') || 'Не указано'}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> {selectedTeacher.email || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Телефон:</strong> {selectedTeacher.phone || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Предметы:</strong>
              <div className="subjects-detail">
                {selectedTeacher.subjects?.map((subject, index) => (
                  <Badge key={index} variant="outline" className="subject-badge">
                    {subject}
                  </Badge>
                )) || 'Не указаны'}
              </div>
            </div>
            <div className="detail-row">
              <strong>Количество уроков:</strong> 
              <Badge variant="info">{selectedTeacher.lessonsCount}</Badge>
            </div>
            <div className="detail-row">
              <strong>Количество студентов:</strong> 
              <Badge variant="success">{selectedTeacher.studentsCount}</Badge>
            </div>
            <div className="detail-row">
              <strong>Последний урок:</strong> 
              {selectedTeacher.lastLesson 
                ? new Date(selectedTeacher.lastLesson).toLocaleDateString('ru-RU')
                : 'Нет'
              }
            </div>
            <div className="detail-row">
              <strong>Роли:</strong> 
              {selectedTeacher.authorities?.length > 0 ? (
                <div className="authorities-list">
                  {selectedTeacher.authorities.map((authority, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {authority}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted">Не указаны</span>
              )}
            </div>
            <div className="detail-row">
              <strong>Пароль:</strong> 
              <Badge variant={selectedTeacher.passwordTemporary ? 'warning' : 'success'}>
                {selectedTeacher.passwordTemporary ? 'Временный' : 'Постоянный'}
              </Badge>
            </div>

            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Toast контейнер */}
      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </div>
  );
};

export default Teachers;
