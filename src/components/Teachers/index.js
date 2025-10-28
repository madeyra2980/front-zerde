import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, Table, Badge, Input, Toast, ToastContainer, useToast } from '../ui';
import Navigation from '../Navigation';
import apiService from '../../service/api';
import { useAuth } from '../../contexts/AuthContext';
import './Teachers.css';

const Teachers = () => {
  const { user } = useAuth();
  const toastApi = useToast();
  const { toasts, removeToast } = toastApi;
  const success = toastApi.success;
  const showError = toastApi.error;
  const warning = toastApi.warning;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    surname: '',
    lastname: '',
    email: '',
    phone: '',
    subjectId: ''
  });
  
  const [editTeacher, setEditTeacher] = useState({
    name: '',
    surname: '',
    lastname: '',
    email: '',
    phone: '',
    subjectId: ''
  });

  useEffect(() => {
    console.log('=== Информация о текущем пользователе ===');
    console.log('User:', user);
    console.log('Token:', localStorage.getItem('accessToken'));
    
    // Пытаемся декодировать токен, чтобы увидеть роли
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
        const parts = cleanToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Roles/Authorities:', payload.authorities || payload.roles || 'Не найдено');
        }
      }
    } catch (error) {
      console.error('Не удалось декодировать токен:', error);
    }
    
    fetchTeachers();
    fetchSubjects();
  }, [user]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      console.log('=== Начинаем загрузку преподавателей ===');
      const teachersData = await apiService.getTeachers();
      console.log('Полученные данные преподавателей:', teachersData);
      console.log('Тип данных:', typeof teachersData);
      console.log('Является ли массивом:', Array.isArray(teachersData));
      console.log('Количество преподавателей:', Array.isArray(teachersData) ? teachersData.length : 0);
      
      // Показываем первого преподавателя для проверки структуры
      if (Array.isArray(teachersData) && teachersData.length > 0) {
        console.log('Пример данных первого преподавателя:', teachersData[0]);
        console.log('Поля первого преподавателя:', Object.keys(teachersData[0]));
      }
      
      // Убеждаемся, что teachersData является массивом
      if (Array.isArray(teachersData)) {
        // Add id field to each teacher for tracking
        const teachersWithId = teachersData.map((teacher, index) => ({
          ...teacher,
          id: teacher.id || teacher.teacherId || teacher.userId || teacher.teacher_id || index + 1
        }));
        setTeachers(teachersWithId);
        console.log('✅ Преподаватели успешно загружены');
      } else {
        console.warn('❌ API вернул не массив, устанавливаем пустой массив');
        setTeachers([]);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки преподавателей:', error);
      console.error('Детали ошибки:', error.message);
      if (error.message.includes('403')) {
        console.error('⚠️ Ошибка доступа: Убедитесь, что у вас есть права ADMIN');
      }
      setTeachers([]); 
    } finally {
      setLoading(false);
      console.log('=== Загрузка преподавателей завершена ===');
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjectsData = await apiService.getSubjects();
      console.log('Полученные предметы:', subjectsData);
      if (Array.isArray(subjectsData)) {
        setSubjects(subjectsData);
      } else {
        console.warn('API по предметам вернул не массив, устанавливаем []');
        setSubjects([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки предметов:', error);
    }
  };

  const handleCreateTeacher = () => {
    setShowCreateForm(true);
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsForm(true);
  };

  const handleEditTeacher = (teacher) => {
    console.log('=== ОТКРЫТИЕ ФОРМЫ РЕДАКТИРОВАНИЯ ===');
    console.log('Teacher object:', teacher);
    console.log('Teacher ID:', teacher.id);
    console.log('Teacher ID (alternative fields):', {
      id: teacher.id,
      teacherId: teacher.teacherId,
      userId: teacher.userId,
      teacher_id: teacher.teacher_id
    });
    console.log('===============================');
    
    setSelectedTeacher(teacher);
    // Find the subject ID if the teacher has subjects
    let subjectId = '';
    if (teacher.subjects && teacher.subjects.length > 0) {
      const firstSubject = teacher.subjects[0];
      const subject = subjects.find(s => 
        s.subject_name === firstSubject.subject_name || 
        s.name === firstSubject.name ||
        s.subject_id === firstSubject.subject_id
      );
      subjectId = subject ? (subject.subject_id || subject.id) : '';
    }
    
    setEditTeacher({
      name: teacher.name || '',
      surname: teacher.surName || '',
      lastname: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subjectId: subjectId
    });
    setShowEditForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setNewTeacher({
      name: '',
      surname: '',
      lastname: '',
      email: '',
      phone: '',
      subjectId: ''
    });
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedTeacher(null);
    setEditTeacher({
      name: '',
      surname: '',
      lastname: '',
      email: '',
      phone: '',
      subjectId: ''
    });
  };

  const handleCloseDetailsForm = () => {
    setShowDetailsForm(false);
    setSelectedTeacher(null);
  };

  const handleInputChange = (field, value) => {
    setNewTeacher(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditTeacher(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleCreateTeacherSubmit = async () => {
    // Валидация
    if (!newTeacher.name || !newTeacher.surname || !newTeacher.lastname || !newTeacher.email || !newTeacher.subjectId) {
      warning('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      // Находим предмет по ID - Backend возвращает subject_id и subject_name
      const selectedSubject = subjects.find(subject => subject.subject_id === parseInt(newTeacher.subjectId));
      const teacherData = {
        name: newTeacher.name,
        surName: newTeacher.surname,  // Backend ожидает surName
        lastName: newTeacher.lastname, // Backend ожидает lastName
        email: newTeacher.email,
        phone: newTeacher.phone,
        subjectName: selectedSubject ? (selectedSubject.subject_name || '') : ''
      };
      
      console.log('Отправляем данные преподавателя:', teacherData);
      await apiService.createTeacher(teacherData);
      await fetchTeachers();
      handleCloseCreateForm();
      success('Преподаватель успешно добавлен');
    } catch (error) {
      console.error('Ошибка создания преподавателя:', error);
      showError(`Ошибка: ${error.message}`);
    }
  };

  const handleEditTeacherSubmit = async () => {
    // Валидация
    if (!editTeacher.name || !editTeacher.surname || !editTeacher.lastname || !editTeacher.email || !editTeacher.subjectId) {
      warning('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Диагностика перед редактированием
    console.log('=== ДИАГНОСТИКА ПЕРЕД РЕДАКТИРОВАНИЕМ ПРЕПОДАВАТЕЛЯ ===');
    const token = localStorage.getItem('accessToken');
    console.log('Raw token:', token);
    
    try {
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
        const parts = cleanToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Roles/Authorities:', payload.authorities || payload.roles || 'Не найдено');
        }
      }
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
    }
    console.log('Teacher ID:', selectedTeacher.id);
    console.log('===============================');

    try {
      // Находим предмет по ID
      const selectedSubject = subjects.find(subject => subject.subject_id === parseInt(editTeacher.subjectId));
      const teacherData = {
        name: editTeacher.name,
        surName: editTeacher.surname,
        lastName: editTeacher.lastname,
        email: editTeacher.email,
        phone: editTeacher.phone,
        subjectName: selectedSubject ? (selectedSubject.subject_name || '') : ''
      };
      
      console.log('Отправляем данные для редактирования преподавателя:', teacherData);
      
      // Try different ID fields
      const teacherId = selectedTeacher.id || selectedTeacher.teacherId || selectedTeacher.userId || selectedTeacher.teacher_id;
      console.log('Using teacher ID for edit:', teacherId);
      
      await apiService.editTeacher(teacherId, teacherData);
      await fetchTeachers();
      handleCloseEditForm();
      success('Преподаватель успешно отредактирован');
    } catch (error) {
      console.error('Ошибка редактирования преподавателя:', error);
      if (error.message.includes('403')) {
        showError('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для редактирования преподавателей.');
      } else {
        showError(`Ошибка: ${error.message}`);
      }
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const teacherName = `${teacher.name} ${teacher.surName} ${teacher.lastName}`;
    const confirmed = window.confirm(`Вы уверены, что хотите удалить преподавателя "${teacherName}"?`);
    
    if (!confirmed) {
      return;
    }


    
    const token = localStorage.getItem('accessToken');
    console.log('Raw token:', token);
    
    try {
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
        const parts = cleanToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Roles/Authorities:', payload.authorities || payload.roles || 'Не найдено');
        }
      }
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
    }
    console.log('===============================');

    // Try different ID fields
    const teacherId = teacher.id || teacher.teacherId || teacher.userId || teacher.teacher_id;
    console.log('Using teacher ID:', teacherId);

    try {
      await apiService.deleteTeacher(teacherId);
      await fetchTeachers();
      success('Преподаватель успешно удален');
    } catch (error) {
      console.error('Ошибка удаления преподавателя:', error);
      if (error.message.includes('403')) {
        showError('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для удаления преподавателей.');
      } else {
        showError(`Ошибка: ${error.message}`);
      }
    }
  };

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter(teacher => {
    // Backend возвращает surName и lastName
    const fullName = `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`.toLowerCase();
    const email = (teacher.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  }) : [];

  const getTeacherSubjects = (teacher) => {
    if (!teacher.subjects || !Array.isArray(teacher.subjects)) return 'Нет предметов';
    // Backend возвращает subject_name или name
    return teacher.subjects.map(subject => subject.subject_name || subject.name).join(', ');
  };

  const getTeacherAuthorities = (teacher) => {
    if (!teacher.authorities) return 'Нет ролей';
    // Authorities теперь приходит как массив объектов с полем authority
    if (Array.isArray(teacher.authorities)) {
      return teacher.authorities.map(auth => auth.authority || auth).join(', ');
    }
    // На случай если приходит один объект
    return teacher.authorities.authority || teacher.authorities;
  };

  const columns = [
    {
      key: 'name',
      title: 'ФИО',
      render: (teacher) => `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`
    },
    {
      key: 'email',
      title: 'Email',
      render: (teacher) => teacher.email || 'Не указан'
    },
    {
      key: 'subjects',
      title: 'Предметы',
      render: (teacher) => (
        <div className="teacher-subjects">
          {getTeacherSubjects(teacher)}
        </div>
      )
    },
    {
      key: 'authorities',
      title: 'Роли',
      render: (teacher) => (
        <div className="teacher-authorities">
          {teacher.authorities?.map((auth, index) => (
            <Badge key={index} variant="info" size="sm">
              {auth.authority}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'passwordTemporary',
      title: 'Статус пароля',
      render: (teacher) => (
        <Badge variant={teacher.passwordTemporary ? "warning" : "success"}>
          {teacher.passwordTemporary ? 'Временный' : 'Постоянный'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (teacher) => (
        <div className="teacher-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(teacher)}
          >
            Подробнее
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditTeacher(teacher)}
          >
            Редактировать
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteTeacher(teacher)}
            style={{ color: '#dc3545', borderColor: '#dc3545' }}
          >
            Удалить
          </Button>
        </div>
      )
    }
  ];

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
          <Button onClick={handleCreateTeacher}>
            Добавить преподавателя
          </Button>
        </div>

        {/* Форма добавления преподавателя */}
        {showCreateForm && (
          <Card className="create-teacher-card">
            <div className="create-teacher-header">
              <h2>Добавление нового преподавателя</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseCreateForm}
              >
                ✕
              </Button>
            </div>
            
            <div className="create-teacher-form">
              <div className="form-row">
                
                
                <div className="form-group">
                  <label>
                    Фамилия 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите фамилию"
                    value={newTeacher.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Имя 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите имя"
                    value={newTeacher.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    Отчество 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите отчество"
                    value={newTeacher.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="email" 
                    placeholder="Введите email"
                    value={newTeacher.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Телефон</label>
                  <Input 
                    type="tel" 
                    placeholder="Введите телефон"
                    value={newTeacher.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Предмет 
                    <span className="required">*</span>
                  </label>
                  <select
                    value={newTeacher.subjectId}
                    onChange={(e) => handleInputChange('subjectId', e.target.value)}
                    className="subject-select"
                  >
                    <option value="">Выберите предмет</option>
                    {Array.isArray(subjects) && subjects.map(subject => (
                      <option key={subject.subject_id ?? subject.id} value={subject.subject_id ?? subject.id}>
                        {subject?.subject_name || subject?.name || `ID: ${subject?.subject_id ?? subject?.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={handleCloseCreateForm}
                >
                  Отмена
                </Button>
                <Button onClick={handleCreateTeacherSubmit}>
                  Добавить преподавателя
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Форма деталей преподавателя */}
        {showDetailsForm && selectedTeacher && (
          <Card className="teacher-details-card">
            <div className="teacher-details-header">
              <h2>Информация о преподавателе</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseDetailsForm}
              >
                ✕
              </Button>
            </div>
            
            <div className="teacher-details-content">
              <div className="teacher-avatar">
                <div className="avatar-circle">
                  {selectedTeacher.name?.[0]}{selectedTeacher.surName?.[0]}
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <strong>ФИО:</strong> {selectedTeacher.name} {selectedTeacher.surName} {selectedTeacher.lastName}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {selectedTeacher.email || 'Не указан'}
                </div>
                <div className="detail-item">
                  <strong>Предметы:</strong> {getTeacherSubjects(selectedTeacher)}
                </div>
                <div className="detail-item">
                  <strong>Роли:</strong> {getTeacherAuthorities(selectedTeacher)}
                </div>
                <div className="detail-item">
                  <strong>Статус пароля:</strong> 
                  <Badge variant={selectedTeacher.passwordTemporary ? "warning" : "success"}>
                    {selectedTeacher.passwordTemporary ? 'Временный' : 'Постоянный'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {showEditForm && selectedTeacher && (
          <Card className="create-teacher-card">
            <div className="create-teacher-header">
              <h2>Редактирование преподавателя</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseEditForm}
              >
                ✕
              </Button>
            </div>
            
            <div className="create-teacher-form">
              <div className="form-row">
               
                
                <div className="form-group">
                  <label>
                    Фамилия 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите фамилию"
                    value={editTeacher.surname}
                    onChange={(e) => handleEditInputChange('surname', e.target.value)}
                  />
                </div>

                
                
                <div className="form-group">
                  <label>
                    Отчество 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите отчество"
                    value={editTeacher.lastname}
                    onChange={(e) => handleEditInputChange('lastname', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="email" 
                    placeholder="Введите email"
                    value={editTeacher.email}
                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Телефон</label>
                  <Input 
                    type="tel" 
                    placeholder="Введите телефон"
                    value={editTeacher.phone}
                    onChange={(e) => handleEditInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Предмет 
                    <span className="required">*</span>
                  </label>
                  <select
                    value={editTeacher.subjectId}
                    onChange={(e) => handleEditInputChange('subjectId', e.target.value)}
                    className="subject-select"
                  >
                    <option value="">Выберите предмет</option>
                    {Array.isArray(subjects) && subjects.map(subject => (
                      <option key={subject.subject_id ?? subject.id} value={subject.subject_id ?? subject.id}>
                        {subject?.subject_name || subject?.name || `ID: ${subject?.subject_id ?? subject?.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={handleCloseEditForm}
                >
                  Отмена
                </Button>
                <Button onClick={handleEditTeacherSubmit}>
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="teachers-content">
          <Card className="teachers-card">
            <div className="teachers-toolbar">
              <div className="search-container">
                <Input
                  type="text"
                  placeholder="Поиск по ФИО или email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="teachers-stats">
                <div className="stat-item">
                  <span className="stat-number">{Array.isArray(teachers) ? teachers.length : 0}</span>
                  <span className="stat-label">Всего преподавателей</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {Array.isArray(teachers) ? teachers.filter(t => t.subjects && t.subjects.length > 0).length : 0}
                  </span>
                  <span className="stat-label">С предметами</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {Array.isArray(teachers) ? teachers.filter(t => !t.passwordTemporary).length : 0}
                  </span>
                  <span className="stat-label">С постоянным паролем</span>
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
