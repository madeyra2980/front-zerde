import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardBody, 
  CardFooter,
  Button, 
  Loading, 
  Badge, 
  StatusBadge,
  Dropdown,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Toast,
  ToastContainer,
  useToast,
  Table
} from '../ui';
import Navigation from '../Navigation';
import Footer from '../Footer';
import apiService from '../../service/api';
import './Schedule.css';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, day, month
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [showLegend, setShowLegend] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const { info: showToast, toasts, removeToast } = useToast();

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, viewMode]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await apiService.request('/api/v1/admin/week-schedule');
      setSchedule(data);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
      showToast('Ошибка загрузки расписания. Проверьте авторизацию.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Понедельник

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTimeSlots = () => {
    return [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];
  };

  const getUniqueRooms = () => {
    const rooms = new Set();
    schedule.forEach(roomSchedule => {
      if (roomSchedule.room?.name) {
        rooms.add(roomSchedule.room.name);
      }
    });
    return Array.from(rooms);
  };

  const getUniqueTeachers = () => {
    const teachers = new Set();
    schedule.forEach(roomSchedule => {
      if (roomSchedule.lessons) {
        roomSchedule.lessons.forEach(lesson => {
          if (lesson.teacher?.name) {
            teachers.add(lesson.teacher.name);
          }
        });
      }
    });
    return Array.from(teachers);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setShowModal(true);
    showToast(`Выбрано занятие: ${lesson.subject?.name || 'Без названия'}`, 'info');
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    showToast(`Режим просмотра изменен на: ${mode}`, 'info');
  };

  const handleRoomFilter = (room) => {
    setSelectedRoom(room);
    showToast(`Фильтр по комнате: ${room}`, 'info');
  };

  const handleTeacherFilter = (teacher) => {
    setSelectedTeacher(teacher);
    showToast(`Фильтр по преподавателю: ${teacher}`, 'info');
  };

  const getFilteredSchedule = () => {
    return schedule.filter(roomSchedule => {
      if (selectedRoom !== 'all' && roomSchedule.room?.name !== selectedRoom) {
        return false;
      }
      return true;
    }).map(roomSchedule => ({
      ...roomSchedule,
      lessons: roomSchedule.lessons?.filter(lesson => {
        if (selectedTeacher !== 'all' && lesson.teacher?.name !== selectedTeacher) {
          return false;
        }
        return true;
      }) || []
    }));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'SCHEDULED': '#17a2b8',
      'IN_PROGRESS': '#ffc107',
      'COMPLETED': '#28a745',
      'CANCELLED': '#dc3545'
    };
    return statusMap[status] || '#6c757d';
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    const timeSlots = getTimeSlots();
    const filteredSchedule = getFilteredSchedule();

    return (
      <div className="schedule-week">
        <div className="schedule-header">
          <div className="time-column"></div>
          {days.map((day, index) => (
            <div key={index} className="day-header">
              <div className="day-name">{formatDate(day)}</div>
              <div className="day-date">{day.getDate()}</div>
            </div>
          ))}
        </div>
        
        <div className="schedule-body">
          {timeSlots.map((time, timeIndex) => (
            <div key={timeIndex} className="schedule-row">
              <div className="time-slot">{time}</div>
              {days.map((day, dayIndex) => (
                <div key={dayIndex} className="day-cell">
                  {filteredSchedule.map((roomSchedule, roomIndex) => {
                    const roomLessons = roomSchedule.lessons || [];
                    const lesson = roomLessons.find(lesson => {
                      const lessonDate = new Date(lesson.date);
                      return lessonDate.toDateString() === day.toDateString() &&
                             formatTime(lesson.from) === time;
                    });
                    
                    if (lesson) {
                      return (
                        <div
                          key={`${roomIndex}-${lesson.id}`}
                          className="lesson-block"
                          style={{ backgroundColor: getStatusColor(lesson.status) }}
                          title={`${lesson.subject?.name || 'Урок'} - ${lesson.teacher?.name || 'Преподаватель'} - ${lesson.room?.name || 'Комната'}`}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <div className="lesson-subject">{lesson.subject?.name || 'Урок'}</div>
                          <div className="lesson-teacher">{lesson.teacher?.name || 'Преподаватель'}</div>
                          <div className="lesson-room">{lesson.room?.name || 'Комната'}</div>
                          <StatusBadge 
                            variant={lesson.status === 'COMPLETED' ? 'success' : lesson.status === 'IN_PROGRESS' ? 'warning' : 'info'}
                            size="sm"
                          >
                            {lesson.status}
                          </StatusBadge>
                        </div>
                      );
                    }
                    return <div key={`empty-${dayIndex}`} className="empty-cell"></div>;
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = selectedDate;
    const timeSlots = getTimeSlots();

    return (
      <div className="schedule-day">
        <div className="day-header">
          <h3>{today.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>
        </div>
        
        <div className="day-schedule">
          {timeSlots.map((time, index) => {
            const lessons = schedule.flatMap(room => room.lessons || [])
              .filter(lesson => {
                const lessonDate = new Date(lesson.date);
                return lessonDate.toDateString() === today.toDateString() &&
                       formatTime(lesson.from) === time;
              });

            return (
              <div key={index} className="time-slot-row">
                <div className="time-label">{time}</div>
                <div className="lessons-container">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, lessonIndex) => (
                      <Card key={lessonIndex} className="lesson-card" onClick={() => handleLessonClick(lesson)}>
                        <CardHeader>
                          <CardTitle>{lesson.subject?.name || 'Урок'}</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <p>Преподаватель: {lesson.teacher?.name || 'Не назначен'}</p>
                          <p>Комната: {lesson.room?.name || 'Не указана'}</p>
                          <p>Время: {formatTime(lesson.from)} - {formatTime(lesson.to)}</p>
                          <StatusBadge 
                            variant={lesson.status === 'COMPLETED' ? 'success' : lesson.status === 'IN_PROGRESS' ? 'warning' : 'info'}
                            size="sm"
                          >
                            {lesson.status}
                          </StatusBadge>
                        </CardBody>
                      </Card>
                    ))
                  ) : (
                    <div className="no-lessons">Нет уроков</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="schedule">
        <Navigation />
        <div className="schedule-loading">
          <Loading size="lg" text="Загрузка расписания..." />
        </div>
      </div>
    );
  }

  return (
    <div className="schedule">
      <Navigation />
      
      <div className="schedule-container">
        <Card>
          <CardHeader>
            <CardTitle>Расписание</CardTitle>
            <p>Просмотр и управление расписанием занятий</p>
          </CardHeader>
          <CardBody>
            <div className="schedule-controls">
              <div className="view-mode-selector">
                <Dropdown
                  options={[
                    { value: 'week', label: 'Неделя' },
                    { value: 'day', label: 'День' }
                  ]}
                  value={viewMode}
                  onChange={(value) => handleViewModeChange(value)}
                  placeholder="Выберите режим"
                />
              </div>
              
              <div className="date-navigation">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  ← Назад
                </Button>
                <span className="current-date">
                  {selectedDate.toLocaleDateString('ru-RU')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  Вперед →
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="schedule-content">
          <Card className="schedule-card">
            {/* Панель фильтров */}
            <div className="schedule-filters">
              <div className="filter-group">
                <label>Комната:</label>
                <Dropdown
                  options={[
                    { value: 'all', label: 'Все комнаты' },
                    ...getUniqueRooms().map(room => ({
                      value: room,
                      label: room
                    }))
                  ]}
                  value={selectedRoom}
                  onChange={(value) => handleRoomFilter(value)}
                  placeholder="Выберите комнату"
                />
              </div>
              
              <div className="filter-group">
                <label>Преподаватель:</label>
                <Dropdown
                  options={[
                    { value: 'all', label: 'Все преподаватели' },
                    ...getUniqueTeachers().map(teacher => ({
                      value: teacher,
                      label: teacher
                    }))
                  ]}
                  value={selectedTeacher}
                  onChange={(value) => handleTeacherFilter(value)}
                  placeholder="Выберите преподавателя"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                {showLegend ? 'Скрыть' : 'Показать'} легенду
              </Button>
            </div>

            {/* Легенда */}
            {showLegend && (
              <div className="schedule-legend">
                <h4>Статусы уроков:</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#17a2b8' }}></div>
                    <span>Запланирован</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
                    <span>В процессе</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
                    <span>Завершен</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
                    <span>Отменен</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'week' ? renderWeekView() : renderDayView()}
          </Card>
        </div>
      </div>
      
      {/* Модальное окно для деталей занятия */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>
          <CardTitle>{selectedLesson?.subject?.name || 'Занятие'}</CardTitle>
        </ModalHeader>
        <ModalBody>
          {selectedLesson && (
            <div className="lesson-details">
              <p><strong>Преподаватель:</strong> {selectedLesson.teacher?.name || 'Не назначен'}</p>
              <p><strong>Комната:</strong> {selectedLesson.room?.name || 'Не указана'}</p>
              <p><strong>Время:</strong> {formatTime(selectedLesson.from)} - {formatTime(selectedLesson.to)}</p>
              <p><strong>Дата:</strong> {new Date(selectedLesson.date).toLocaleDateString('ru-RU')}</p>
              <StatusBadge 
                variant={selectedLesson.status === 'COMPLETED' ? 'success' : selectedLesson.status === 'IN_PROGRESS' ? 'warning' : 'info'}
                size="md"
              >
                {selectedLesson.status}
              </StatusBadge>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Закрыть
          </Button>
          <Button variant="primary">
            Редактировать
          </Button>
        </ModalFooter>
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

export default Schedule;
