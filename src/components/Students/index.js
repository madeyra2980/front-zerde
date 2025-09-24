import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, Modal, Table, Badge, Input } from '../ui';
import Navigation from '../Navigation';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Получаем студентов через API уроков (в реальном приложении должен быть отдельный endpoint)
      const response = await fetch('http://localhost:8080/api/v1/admin/lessons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const lessons = await response.json();
        // Извлекаем уникальных студентов из уроков
        const studentsMap = new Map();
        lessons.forEach(lesson => {
          if (lesson.children) {
            lesson.children.forEach(child => {
              if (!studentsMap.has(child.id)) {
                studentsMap.set(child.id, {
                  ...child,
                  lessonsCount: 0,
                  lastLesson: null
                });
              }
              const student = studentsMap.get(child.id);
              student.lessonsCount++;
              if (!student.lastLesson || new Date(lesson.date) > new Date(student.lastLesson)) {
                student.lastLesson = lesson.date;
              }
            });
          }
        });
        setStudents(Array.from(studentsMap.values()));
      } else {
        console.error('Ошибка загрузки студентов:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки студентов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    setShowCreateModal(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      title: 'ID',
      width: '80px'
    },
    {
      key: 'name',
      title: 'Имя',
      render: (student) => `${student.firstName} ${student.lastName}`
    },
    {
      key: 'email',
      title: 'Email',
      render: (student) => student.email || 'Не указан'
    },
    {
      key: 'phone',
      title: 'Телефон',
      render: (student) => student.phone || 'Не указан'
    },
    {
      key: 'age',
      title: 'Возраст',
      render: (student) => student.age || 'Не указан'
    },
    {
      key: 'lessonsCount',
      title: 'Уроков',
      render: (student) => (
        <Badge variant="info">{student.lessonsCount}</Badge>
      )
    },
    {
      key: 'lastLesson',
      title: 'Последний урок',
      render: (student) => student.lastLesson 
        ? new Date(student.lastLesson).toLocaleDateString('ru-RU')
        : 'Нет'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (student) => (
        <div className="student-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(student)}
          >
            Подробнее
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
          <Button onClick={handleCreateStudent} className="create-button">
            ➕ Добавить студента
          </Button>
        </div>

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
                    {students.filter(s => s.lessonsCount > 0).length}
                  </span>
                  <span className="stat-label">Активных</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {students.filter(s => s.lessonsCount === 0).length}
                  </span>
                  <span className="stat-label">Без уроков</span>
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

      {/* Модальное окно создания студента */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Добавление нового студента"
      >
        <div className="create-student-form">
          <div className="form-group">
            <label>Имя *</label>
            <Input type="text" placeholder="Введите имя" />
          </div>
          <div className="form-group">
            <label>Фамилия *</label>
            <Input type="text" placeholder="Введите фамилию" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <Input type="email" placeholder="Введите email" />
          </div>
          <div className="form-group">
            <label>Телефон</label>
            <Input type="tel" placeholder="Введите телефон" />
          </div>
          <div className="form-group">
            <label>Возраст</label>
            <Input type="number" placeholder="Введите возраст" />
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

      {/* Модальное окно деталей студента */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Информация о студенте"
      >
        {selectedStudent && (
          <div className="student-details">
            <div className="student-avatar">
              <div className="avatar-circle">
                {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
              </div>
            </div>
            
            <div className="detail-row">
              <strong>ID:</strong> {selectedStudent.id}
            </div>
            <div className="detail-row">
              <strong>Имя:</strong> {selectedStudent.firstName} {selectedStudent.lastName}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> {selectedStudent.email || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Телефон:</strong> {selectedStudent.phone || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Возраст:</strong> {selectedStudent.age || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Количество уроков:</strong> 
              <Badge variant="info">{selectedStudent.lessonsCount}</Badge>
            </div>
            <div className="detail-row">
              <strong>Последний урок:</strong> 
              {selectedStudent.lastLesson 
                ? new Date(selectedStudent.lastLesson).toLocaleDateString('ru-RU')
                : 'Нет'
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
    </div>
  );
};

export default Students;
