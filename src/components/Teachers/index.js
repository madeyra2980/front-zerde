import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, Modal, Table, Badge, Input } from '../ui';
import Navigation from '../Navigation';
import './Teachers.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // Получаем преподавателей через API уроков
      const response = await fetch('http://localhost:8080/api/v1/admin/lessons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const lessons = await response.json();
        // Извлекаем уникальных преподавателей из уроков
        const teachersMap = new Map();
        lessons.forEach(lesson => {
          if (lesson.teacher) {
            const teacherId = lesson.teacher.id || lesson.teacher.name;
            if (!teachersMap.has(teacherId)) {
              teachersMap.set(teacherId, {
                ...lesson.teacher,
                lessonsCount: 0,
                studentsCount: 0,
                lastLesson: null,
                subjects: new Set()
              });
            }
            const teacher = teachersMap.get(teacherId);
            teacher.lessonsCount++;
            teacher.studentsCount += lesson.children?.length || 0;
            if (lesson.subject) {
              teacher.subjects.add(lesson.subject.name);
            }
            if (!teacher.lastLesson || new Date(lesson.date) > new Date(teacher.lastLesson)) {
              teacher.lastLesson = lesson.date;
            }
          }
        });
        
        // Преобразуем Set в массив для subjects
        const teachersArray = Array.from(teachersMap.values()).map(teacher => ({
          ...teacher,
          subjects: Array.from(teacher.subjects)
        }));
        
        setTeachers(teachersArray);
      } else {
        console.error('Ошибка загрузки преподавателей:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки преподавателей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = () => {
    setShowCreateModal(true);
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (lessonsCount) => {
    if (lessonsCount === 0) return <Badge variant="secondary">Неактивен</Badge>;
    if (lessonsCount < 5) return <Badge variant="warning">Мало уроков</Badge>;
    if (lessonsCount < 15) return <Badge variant="info">Активен</Badge>;
    return <Badge variant="success">Очень активен</Badge>;
  };

  const columns = [
    {
      key: 'id',
      title: 'ID',
      width: '80px'
    },
    {
      key: 'name',
      title: 'Имя',
      render: (teacher) => teacher.name || 'Не указано'
    },
    {
      key: 'email',
      title: 'Email',
      render: (teacher) => teacher.email || 'Не указан'
    },
    {
      key: 'phone',
      title: 'Телефон',
      render: (teacher) => teacher.phone || 'Не указан'
    },
    {
      key: 'subjects',
      title: 'Предметы',
      render: (teacher) => (
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
      )
    },
    {
      key: 'lessonsCount',
      title: 'Уроков',
      render: (teacher) => (
        <Badge variant="info">{teacher.lessonsCount}</Badge>
      )
    },
    {
      key: 'studentsCount',
      title: 'Студентов',
      render: (teacher) => (
        <Badge variant="success">{teacher.studentsCount}</Badge>
      )
    },
    {
      key: 'status',
      title: 'Статус',
      render: (teacher) => getStatusBadge(teacher.lessonsCount)
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
          <Button onClick={handleCreateTeacher} className="create-button">
            ➕ Добавить преподавателя
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
      >
        <div className="create-teacher-form">
          <div className="form-group">
            <label>Имя *</label>
            <Input type="text" placeholder="Введите имя преподавателя" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <Input type="email" placeholder="Введите email" />
          </div>
          <div className="form-group">
            <label>Телефон</label>
            <Input type="tel" placeholder="Введите телефон" />
          </div>
          <div className="form-group">
            <label>Специализация</label>
            <Input type="text" placeholder="Введите специализацию" />
          </div>
          <div className="form-group">
            <label>Опыт работы (лет)</label>
            <Input type="number" placeholder="Введите опыт работы" />
          </div>
          <div className="form-group">
            <label>Образование</label>
            <Input type="text" placeholder="Введите образование" />
          </div>
          
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Отмена
            </Button>
            <Button onClick={() => setShowCreateModal(false)}>
              Добавить
            </Button>
          </div>
        </div>
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
              <strong>Имя:</strong> {selectedTeacher.name || 'Не указано'}
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
              <strong>Статус:</strong> 
              {getStatusBadge(selectedTeacher.lessonsCount)}
            </div>

            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Teachers;
