import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, Modal, Table, Badge } from '../ui';
import Navigation from '../Navigation';
import './Lessons.css';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/admin/lessons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      } else {
        console.error('Ошибка загрузки уроков:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    setShowCreateModal(true);
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
      key: 'id',
      title: 'ID',
      width: '80px'
    },
    {
      key: 'subject',
      title: 'Предмет',
      render: (lesson) => lesson.subject?.name || 'Не указан'
    },
    {
      key: 'teacher',
      title: 'Преподаватель',
      render: (lesson) => lesson.teacher?.name || 'Не назначен'
    },
    {
      key: 'room',
      title: 'Комната',
      render: (lesson) => lesson.room?.name || 'Не указана'
    },
    {
      key: 'date',
      title: 'Дата',
      render: (lesson) => formatDate(lesson.date)
    },
    {
      key: 'time',
      title: 'Время',
      render: (lesson) => `${formatTime(lesson.from)} - ${formatTime(lesson.to)}`
    },
    {
      key: 'students',
      title: 'Студенты',
      render: (lesson) => lesson.children?.length || 0
    },
    {
      key: 'status',
      title: 'Статус',
      render: (lesson) => getStatusBadge(lesson.status)
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (lesson) => (
        <div className="lesson-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(lesson)}
          >
            Подробнее
          </Button>
        </div>
      )
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
          <Button onClick={handleCreateLesson} className="create-button">
            ➕ Создать урок
          </Button>
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
                  {lessons.filter(lesson => lesson.status === 'SCHEDULED').length}
                </span>
                <span className="stat-label">Запланировано</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {lessons.filter(lesson => lesson.status === 'IN_PROGRESS').length}
                </span>
                <span className="stat-label">В процессе</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {lessons.filter(lesson => lesson.status === 'COMPLETED').length}
                </span>
                <span className="stat-label">Завершено</span>
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
      >
        <div className="create-lesson-form">
          <p>Форма создания урока будет здесь</p>
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Отмена
            </Button>
            <Button onClick={() => setShowCreateModal(false)}>
              Создать
            </Button>
          </div>
        </div>
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
              <strong>ID:</strong> {selectedLesson.id}
            </div>
            <div className="detail-row">
              <strong>Предмет:</strong> {selectedLesson.subject?.name || 'Не указан'}
            </div>
            <div className="detail-row">
              <strong>Преподаватель:</strong> {selectedLesson.teacher?.name || 'Не назначен'}
            </div>
            <div className="detail-row">
              <strong>Комната:</strong> {selectedLesson.room?.name || 'Не указана'}
            </div>
            <div className="detail-row">
              <strong>Дата:</strong> {formatDate(selectedLesson.date)}
            </div>
            <div className="detail-row">
              <strong>Время:</strong> {formatTime(selectedLesson.from)} - {formatTime(selectedLesson.to)}
            </div>
            <div className="detail-row">
              <strong>Статус:</strong> {getStatusBadge(selectedLesson.status)}
            </div>
            <div className="detail-row">
              <strong>Студенты:</strong> {selectedLesson.children?.length || 0}
            </div>
            
            {selectedLesson.children && selectedLesson.children.length > 0 && (
              <div className="students-list">
                <h4>Список студентов:</h4>
                <ul>
                  {selectedLesson.children.map((child, index) => (
                    <li key={index}>
                      {child.firstName} {child.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

export default Lessons;
