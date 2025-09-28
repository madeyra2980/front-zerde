import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, Modal, Table, Badge, Input, Toast, ToastContainer } from '../ui';
import Navigation from '../Navigation';
import apiService from '../../service/api';
import './Lessons.css';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Данные для создания урока
  const [formData, setFormData] = useState({
    createLessonFrom: '',
    createLessonTo: '',
    groupType: '',
    groupId: 0,
    subjectId: 0,
    roomId: 0,
    teacherId: 0,
    childName: '',
    childSurName: '',
    childLastName: '',
    childAge: 0,
    parentName: '',
    parentSurName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: ''
  });
  
  // Списки для выбора
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchLessons();
    fetchSubjects();
    fetchRooms();
    fetchGroups();
    fetchTeachers();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await apiService.request('/api/v1/admin/lessons');
      // Фильтруем null/undefined элементы
      const filteredData = (data || []).filter(lesson => lesson != null);
      setLessons(filteredData);
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiService.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      console.error('Ошибка загрузки предметов:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await apiService.getRooms();
      setRooms(data || []);
    } catch (error) {
      console.error('Ошибка загрузки аудиторий:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await apiService.getGroups();
      setGroups(data || []);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await apiService.getTeachers();
      console.log('Получены учителя:', data);
      console.log('Первый учитель:', data?.[0]);
      setTeachers(data || []);
    } catch (error) {
      console.error('Ошибка загрузки учителей:', error);
    }
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Функция для ручного обновления токенов
  const handleRefreshTokens = async () => {
    try {
      await apiService.manualRefreshToken();
      addToast('Токены успешно обновлены!', 'success');
    } catch (error) {
      console.error('Ошибка обновления токенов:', error);
      addToast('Ошибка обновления токенов', 'error');
    }
  };



  const handleCreateLesson = () => {
    setFormData({
      createLessonFrom: '',
      createLessonTo: '',
      groupType: '',
      groupId: 0,
      subjectId: 0,
      roomId: 0,
      teacherId: 0,
      childName: '',
      childSurName: '',
      childLastName: '',
      childAge: 0,
      parentName: '',
      parentSurName: '',
      parentLastName: '',
      parentPhone: '',
      parentEmail: ''
    });
    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Валидация обязательных полей
      if (!formData.createLessonFrom || !formData.createLessonTo || !formData.groupType || 
          !formData.groupId || !formData.subjectId || !formData.roomId || !formData.teacherId ||
          !formData.childName || !formData.childSurName || !formData.childLastName ||
          !formData.parentName || !formData.parentSurName || !formData.parentLastName ||
          !formData.parentPhone || !formData.parentEmail) {
        addToast('Пожалуйста, заполните все обязательные поля', 'error');
        return;
      }

      // Отправляем данные на сервер
      await apiService.createLesson(formData);
      
      addToast('Урок успешно создан!', 'success');
      setShowCreateModal(false);
      
      // Обновляем список уроков
      fetchLessons();
    } catch (error) {
      console.error('Ошибка создания урока:', error);
      addToast(`Ошибка создания урока: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (lesson) => {
    setSelectedLesson(lesson);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { text: 'Запланирован', variant: 'info' },
      'IN_PROGRESS': { text: 'В процессе', variant: 'warning' },
      'COMPLETED': { text: 'Завершен', variant: 'success' },
      'CANCELLED': { text: 'Отменен', variant: 'danger' }
    };
    
    const statusInfo = statusMap[status] || { text: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'lessonName',
      title: 'Название урока',
      render: (lesson) => {
        if (!lesson) return 'Не указано';
        // Если lessonName null, показываем составное название
        if (!lesson.lessonName) {
          return `${lesson.subjectName || 'Урок'} - ${lesson.groupName || 'Группа'}`;
        }
        return lesson.lessonName;
      }
    },
    {
      key: 'subjectName',
      title: 'Предмет',
      render: (lesson) => {
        if (!lesson) return 'Не указан';
        return lesson.subjectName || 'Не указан';
      }
    },
    {
      key: 'groupName',
      title: 'Группа',
      render: (lesson) => {
        if (!lesson) return 'Не указана';
        return lesson.groupName || 'Не указана';
      }
    },
    {
      key: 'roomName',
      title: 'Аудитория',
      render: (lesson) => {
        if (!lesson) return 'Не указана';
        return lesson.roomName || 'Не указана';
      }
    },
    {
      key: 'lessonDay',
      title: 'День недели',
      render: (lesson) => {
        if (!lesson) return 'Не указан';
        // Если lessonDay null, показываем "Не указан"
        if (!lesson.lessonDay) {
          return 'Не указан';
        }
        const dayMap = {
          'MONDAY': 'Понедельник',
          'TUESDAY': 'Вторник',
          'WEDNESDAY': 'Среда',
          'THURSDAY': 'Четверг',
          'FRIDAY': 'Пятница',
          'SATURDAY': 'Суббота',
          'SUNDAY': 'Воскресенье'
        };
        return dayMap[lesson.lessonDay] || lesson.lessonDay;
      }
    },
    {
      key: 'time',
      title: 'Время',
      render: (lesson) => {
        if (!lesson) return 'Не указано';
        if (lesson.from && lesson.to) {
          return `${lesson.from} - ${lesson.to}`;
        }
        return 'Не указано';
      }
    },
    {
      key: 'groupType',
      title: 'Тип группы',
      render: (lesson) => {
        if (!lesson) return 'Не указан';
        const typeMap = {
          'INDIVIDUAL': 'Индивидуальная',
          'GROUP': 'Групповая',
          'CLASS': 'Классная'
        };
        return typeMap[lesson.groupType] || lesson.groupType || 'Не указан';
      }
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (lesson) => {
        if (!lesson) return null;
        return (
          <div className="lesson-actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(lesson)}
            >
              Подробнее
            </Button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="lessons">
        <Navigation />
        <div className="lessons-loading">
          <Loading size="lg" text="Загрузка уроков..." />
        </div>
      </div>
    );
  }

  return (
    <div className="lessons">
      <Navigation />
      
      <div className="lessons-container">
        <div className="lessons-header">
          <div className="lessons-title">
            <h1>Управление уроками</h1>
            <p>Создание, редактирование и просмотр уроков</p>
          </div>
          <div className="lessons-actions">

            <Button onClick={handleCreateLesson} >
              Создать урок
            </Button>
          </div>
        </div>

        <div className="lessons-content">
          <Card className="lessons-card">
            <div className="lessons-stats">
              <div className="stat-item">
                <span className="stat-number">{lessons.length}</span>
                <span className="stat-label">Всего уроков</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {lessons.filter(lesson => lesson && lesson.groupType === 'INDIVIDUAL').length}
                </span>
                <span className="stat-label">Индивидуальные</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {lessons.filter(lesson => lesson && lesson.groupType === 'GROUP').length}
                </span>
                <span className="stat-label">Групповые</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {lessons.filter(lesson => lesson && lesson.groupType === 'CLASS').length}
                </span>
                <span className="stat-label">Классные</span>
              </div>
            </div>

            <Table
              data={lessons}
              columns={columns}
              className="lessons-table"
            />
          </Card>
        </div>
      </div>

      {/* Модальное окно создания урока */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создание нового урока"
        size="lg"
      >
        <form onSubmit={handleSubmitLesson} className="create-lesson-form">
          <div className="lesson-form-grid">
            {/* Время урока */}
            <div className="lesson-form-field">
              <label>
                Время начала 
                <span className="required">*</span>
              </label>
              <Input
                type="time"
                name="createLessonFrom"
                value={formData.createLessonFrom}
                onChange={handleInputChange}
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Время окончания 
                <span className="required">*</span>
              </label>
              <Input
                type="time"
                name="createLessonTo"
                value={formData.createLessonTo}
                onChange={handleInputChange}
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Тип группы 
                <span className="required">*</span>
              </label>
              <select
                name="groupType"
                value={formData.groupType}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите тип</option>
                <option value="INDIVIDUAL">Индивидуальная</option>
                <option value="GROUP">Групповая</option>
                <option value="CLASS">Классная</option>
              </select>
            </div>

            <div className="lesson-form-field">
              <label>
                Группа 
                <span className="required">*</span>
              </label>
              <select
                name="groupId"
                value={formData.groupId}
                onChange={handleInputChange}
                required
              >
                <option value={0}>Выберите группу</option>
                {groups.map(group => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lesson-form-field">
              <label>
                Предмет 
                <span className="required">*</span>
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                required
              >
                <option value={0}>Выберите предмет</option>
                {subjects.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lesson-form-field">
              <label>
                Аудитория 
                <span className="required">*</span>
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                required
              >
                <option value={0}>Выберите аудиторию</option>
                {rooms.map(room => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.room_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lesson-form-field">
              <label>
                Учитель 
                <span className="required">*</span>
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
              >
                <option value={0}>Выберите учителя</option>
                {teachers.map((teacher, index) => {
                  console.log('Рендерим учителя:', teacher);
                  return (
                    <option key={`teacher-${index}-${teacher.name}-${teacher.surName}`} value={index + 1}>
                      {teacher.name} {teacher.surName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Информация о ребенке */}
            <div className="lesson-form-section">
              <h3>Информация о ребенке</h3>
            </div>

            <div className="lesson-form-field">
              <label>
                Имя ребенка 
                <span className="required">*</span>
              </label>
              <Input
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                placeholder="Введите имя"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Фамилия ребенка 
                <span className="required">*</span>
              </label>
              <Input
                name="childSurName"
                value={formData.childSurName}
                onChange={handleInputChange}
                placeholder="Введите фамилию"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Отчество ребенка 
                <span className="required">*</span>
              </label>
              <Input
                name="childLastName"
                value={formData.childLastName}
                onChange={handleInputChange}
                placeholder="Введите отчество"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Возраст ребенка 
                <span className="required">*</span>
              </label>
              <Input
                type="number"
                name="childAge"
                value={formData.childAge}
                onChange={handleInputChange}
                placeholder="Введите возраст"
                min="1"
                max="18"
                required
                size="md"
              />
            </div>

            {/* Информация о родителе */}
            <div className="lesson-form-section">
              <h3>Информация о родителе</h3>
            </div>

            <div className="lesson-form-field">
              <label>
                Имя родителя 
                <span className="required">*</span>
              </label>
              <Input
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                placeholder="Введите имя"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Фамилия родителя 
                <span className="required">*</span>
              </label>
              <Input
                name="parentSurName"
                value={formData.parentSurName}
                onChange={handleInputChange}
                placeholder="Введите фамилию"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Отчество родителя 
                <span className="required">*</span>
              </label>
              <Input
                name="parentLastName"
                value={formData.parentLastName}
                onChange={handleInputChange}
                placeholder="Введите отчество"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field">
              <label>
                Телефон родителя 
                <span className="required">*</span>
              </label>
              <Input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                placeholder="+7 (999) 999-99-99"
                required
                size="md"
              />
            </div>

            <div className="lesson-form-field full-width">
              <label>
                Email родителя 
                <span className="required">*</span>
              </label>
              <Input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                placeholder="example@email.com"
                required
                size="md"
              />
            </div>
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
              {submitting ? 'Создание...' : 'Создать урок'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модальное окно деталей урока */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Детали урока"
      >
        {selectedLesson && (
          <div className="lesson-details">
            <div className="detail-row">
              <strong>Название урока:</strong> {
                selectedLesson.lessonName 
                  ? selectedLesson.lessonName 
                  : `${selectedLesson.subjectName || 'Урок'} - ${selectedLesson.groupName || 'Группа'}`
              }
            </div>
            <div className="detail-row">
              <strong>Предмет:</strong> {selectedLesson.subjectName || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Группа:</strong> {selectedLesson.groupName || 'Не указана'}
            </div>
            <div className="detail-row">
              <strong>Аудитория:</strong> {selectedLesson.roomName || 'Не указана'}
            </div>
            <div className="detail-row">
              <strong>День недели:</strong> {
                selectedLesson.lessonDay ? (() => {
                  const dayMap = {
                    'MONDAY': 'Понедельник',
                    'TUESDAY': 'Вторник',
                    'WEDNESDAY': 'Среда',
                    'THURSDAY': 'Четверг',
                    'FRIDAY': 'Пятница',
                    'SATURDAY': 'Суббота',
                    'SUNDAY': 'Воскресенье'
                  };
                  return dayMap[selectedLesson.lessonDay] || selectedLesson.lessonDay;
                })() : 'Не указан'
              }
            </div>
            <div className="detail-row">
              <strong>Время:</strong> {
                selectedLesson.from && selectedLesson.to 
                  ? `${selectedLesson.from} - ${selectedLesson.to}`
                  : 'Не указано'
              }
            </div>
            <div className="detail-row">
              <strong>Тип группы:</strong> {
                (() => {
                  const typeMap = {
                    'INDIVIDUAL': 'Индивидуальная',
                    'GROUP': 'Групповая',
                    'CLASS': 'Классная'
                  };
                  return typeMap[selectedLesson.groupType] || selectedLesson.groupType || 'Не указан';
                })()
              }
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
            type={toast.type}
            message={toast.message}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </ToastContainer>
    </div>
  );
};

export default Lessons;
