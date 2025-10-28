import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, Table, Input, Toast, ToastContainer, useToast } from '../ui';
import Navigation from '../Navigation';
import apiService from '../../service/api';
import './Students.css';

const Students = () => {
  const toastApi = useToast();
  const { toasts, removeToast } = toastApi;
  const success = toastApi.success;
  const showError = toastApi.error;
  const warning = toastApi.warning;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    age: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getChildren();
      // Add id field to each student for tracking
      const studentsWithId = data.map((student, index) => ({
        ...student,
        id: student.id || index + 1
      }));
      setStudents(studentsWithId);
    } catch (error) {
      console.error('Ошибка загрузки студентов:', error);
      showError('Не удалось загрузить список студентов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    setFormData({ firstName: '', middleName: '', lastName: '', age: '' });
    setShowCreateForm(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsForm(true);
  };

  const handleEditStudent = (student) => {
    setFormData({
      firstName: student.firstName || '',
      middleName: student.middleName || '',
      lastName: student.lastName || '',
      age: student.age || ''
    });
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setFormData({ firstName: '', middleName: '', lastName: '', age: '' });
  };

  const handleCloseDetailsForm = () => {
    setShowDetailsForm(false);
    setSelectedStudent(null);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedStudent(null);
    setFormData({ firstName: '', middleName: '', lastName: '', age: '' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitCreate = async () => {
    if (!formData.firstName || !formData.lastName) {
      warning('Пожалуйста, заполните обязательные поля');
      return;
    }

    try {
      await apiService.createChild({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        age: parseInt(formData.age) || 0
      });
      await fetchStudents();
      handleCloseCreateForm();
      success('Студент успешно добавлен');
    } catch (error) {
      console.error('Ошибка создания студента:', error);
      showError('Не удалось добавить студента');
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.firstName || !formData.lastName) {
      warning('Пожалуйста, заполните обязательные поля');
      return;
    }

    // Диагностика перед редактированием
    console.log('=== ДИАГНОСТИКА ПЕРЕД РЕДАКТИРОВАНИЕМ СТУДЕНТА ===');
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
    console.log('Student ID:', selectedStudent.id);
    console.log('===============================');

    try {
      await apiService.editChild(selectedStudent.id, {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        age: parseInt(formData.age) || 0
      });
      await fetchStudents();
      handleCloseEditForm();
      success('Студент успешно отредактирован');
    } catch (error) {
      console.error('Ошибка редактирования студента:', error);
      if (error.message.includes('403')) {
        showError('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для редактирования студентов.');
      } else {
        showError(`Ошибка: ${error.message}`);
      }
    }
  };

  const handleDeleteStudent = async (student) => {
    const studentName = `${student.firstName} ${student.lastName}`;
    const confirmed = window.confirm(`Вы уверены, что хотите удалить студента "${studentName}"?`);
    
    if (!confirmed) {
      return;
    }

    // Диагностика перед удалением
    console.log('=== ДИАГНОСТИКА ПЕРЕД УДАЛЕНИЕМ СТУДЕНТА ===');
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
    console.log('Student ID:', student.id);
    console.log('===============================');

    try {
      await apiService.deleteChild(student.id);
      await fetchStudents();
      success('Студент успешно удален');
    } catch (error) {
      console.error('Ошибка удаления студента:', error);
      if (error.message.includes('403')) {
        showError('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для удаления студентов.');
      } else {
        showError(`Ошибка: ${error.message}`);
      }
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.middleName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (student) => student.id
    },
    {
      key: 'name',
      label: 'ФИО',
      render: (student) => `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()
    },
    {
      key: 'age',
      label: 'Возраст',
      render: (student) => student.age || 'Не указан'
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (student) => (
        <div className="student-actions">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewDetails(student)}
          >
            Просмотр
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditStudent(student)}
          >
            Редактировать
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteStudent(student)}
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
      <div className="students">
        <Navigation />
        <div className="students-loading">
          <Loading size="lg" text="Загрузка студентов..." />
        </div>
      </div>
    );
  }

  return (
    <div className="students">
      <Navigation />
      
      <div className="students-container">
        <div className="students-header">
          <div className="students-title">
            <h1>Управление студентами</h1>
            <p>Добавление, редактирование и просмотр информации о студентах</p>
          </div>
          <Button onClick={handleCreateStudent}>
            Добавить детей
          </Button>
        </div>

        {showCreateForm && (
          <Card className="create-student-card">
            <div className="create-student-header">
              <h2>Добавление нового студента</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseCreateForm}
              >
                ✕
              </Button>
            </div>
            
            <div className="create-student-form-inline">
              <div className="form-row">
            
                
           
                
                <div className="form-group">
                  <label>
                    Фамилия 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите фамилию"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                  <label>
                    Имя 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите имя"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>


              <div className="form-group">
                  <label>
                    Отчество
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите отчество"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                  />
                </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Возраст</label>
                  <Input 
                    type="number" 
                    placeholder="Введите возраст"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                
            
                
          
              </div>
              
              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={handleCloseCreateForm}
                >
                  Отмена
                </Button>
                <Button onClick={handleSubmitCreate}>
                  Добавить студента
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Форма деталей студента */}
        {showDetailsForm && selectedStudent && (
          <Card className="student-details-card">
            <div className="student-details-header">
              <h2>Информация о студенте</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseDetailsForm}
              >
                ✕
              </Button>
            </div>
            
            <div className="student-details-content">
              <div className="student-avatar">
                <div className="avatar-circle">
                  {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <strong>ID:</strong> {selectedStudent.id}
                </div>
                <div className="detail-item">
                  <strong>Имя:</strong> {selectedStudent.firstName}
                </div>
                <div className="detail-item">
                  <strong>Отчество:</strong> {selectedStudent.middleName || 'Не указано'}
                </div>
                <div className="detail-item">
                  <strong>Фамилия:</strong> {selectedStudent.lastName}
                </div>
                <div className="detail-item">
                  <strong>Возраст:</strong> {selectedStudent.age || 'Не указан'}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Форма редактирования студента */}
        {showEditForm && selectedStudent && (
          <Card className="create-student-card">
            <div className="create-student-header">
              <h2>Редактирование студента</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseEditForm}
              >
                ✕
              </Button>
            </div>
            
            <div className="create-student-form-inline">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Имя 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите имя"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    Отчество
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите отчество"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    Фамилия 
                    <span className="required">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Введите фамилию"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Возраст</label>
                  <Input 
                    type="number" 
                    placeholder="Введите возраст"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  {/* Пустое поле для выравнивания */}
                </div>
                
                <div className="form-group">
                  {/* Пустое поле для выравнивания */}
                </div>
              </div>
              
              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={handleCloseEditForm}
                >
                  Отмена
                </Button>
                <Button onClick={handleSubmitEdit}>
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="students-content">
          <Card className="students-card">
            <div className="students-toolbar">
              <div className="search-container">
                <Input
                  type="text"
                  placeholder="Поиск по имени или email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="students-stats">
                <div className="stat-item">
                  <span className="stat-number">{students.length}</span>
                  <span className="stat-label">Всего студентов</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {students.filter(s => s.age && s.age > 0).length}
                  </span>
                  <span className="stat-label">С указанным возрастом</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {students.filter(s => s.middleName).length}
                  </span>
                  <span className="stat-label">С отчеством</span>
                </div>
              </div>
            </div>

            <Table
              data={filteredStudents}
              columns={columns}
              className="students-table"
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

export default Students;
