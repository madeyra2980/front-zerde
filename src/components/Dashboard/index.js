import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardBody, 
  CardFooter,
  Button, 
  Loading, 
  StatusBadge,
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FaBook, 
  FaCalendarAlt, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaCog,
  FaPlus,
  FaUserFriends,
  FaClock
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalStudents: 0,
    totalTeachers: 0,
    todayLessons: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    lessonsByDay: [],
    lessonsByStatus: [],
    studentsByMonth: []
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const { info: showToast, toasts, removeToast } = useToast();

  // Функции для генерации данных графиков
  const generateLessonsByDay = (lessons) => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(day => ({
      day,
      lessons: Math.floor(Math.random() * 10) + 1 // Заглушка для демонстрации
    }));
  };

  const generateLessonsByStatus = (lessons) => {
    const statusCounts = lessons.reduce((acc, lesson) => {
      const status = lesson.status || 'SCHEDULED';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusName(status),
      value: count,
      color: getStatusColor(status)
    }));
  };

  const generateStudentsByMonth = (lessons) => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
    return months.map(month => ({
      month,
      students: Math.floor(Math.random() * 50) + 10 // Заглушка для демонстрации
    }));
  };

  const getStatusName = (status) => {
    const statusMap = {
      'SCHEDULED': 'Запланированы',
      'IN_PROGRESS': 'В процессе',
      'COMPLETED': 'Завершены',
      'CANCELLED': 'Отменены'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'SCHEDULED': '#17a2b8',
      'IN_PROGRESS': '#ffc107',
      'COMPLETED': '#28a745',
      'CANCELLED': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Получаем статистику с API
      const [lessonsResponse] = await Promise.allSettled([
        fetch('http://localhost:8080/api/v1/admin/lessons', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const lessons = lessonsResponse.status === 'fulfilled' ? await lessonsResponse.value.json() : [];
      
      // Генерируем данные для графиков
      const lessonsByDay = generateLessonsByDay(lessons);
      const lessonsByStatus = generateLessonsByStatus(lessons);
      const studentsByMonth = generateStudentsByMonth(lessons);
      
      setStats({
        totalLessons: lessons.length,
        totalStudents: lessons.reduce((acc, lesson) => acc + (lesson.children?.length || 0), 0),
        totalTeachers: new Set(lessons.map(lesson => lesson.teacher?.name).filter(Boolean)).size,
        todayLessons: lessons.filter(lesson => {
          const today = new Date().toDateString();
          const lessonDate = new Date(lesson.date).toDateString();
          return lessonDate === today;
        }).length
      });
      
      setChartData({
        lessonsByDay,
        lessonsByStatus,
        studentsByMonth
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleQuickAction = (action) => {
    setSelectedAction(action);
    setShowModal(true);
    showToast(`Выбрано действие: ${action.title}`, 'info');
  };

  const quickActions = [
    { title: 'Добавить занятие', icon: FaPlus, color: '#28a745', description: 'Создать новое занятие для ребенка' },
    { title: 'Управление детьми', icon: FaUsers, color: '#007bff', description: 'Просмотр и редактирование списка детей' },
    { title: 'Расписание', icon: FaCalendarAlt, color: '#ffc107', description: 'Просмотр и управление расписанием' },
    { title: 'Настройки', icon: FaCog, color: '#6c757d', description: 'Настройки системы' }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <Navigation />
        <div className="dashboard-loading">
          <Loading size="lg" text="Загрузка данных..." />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navigation />
      
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Добро пожаловать, {user?.name || 'Пользователь'}!</h1>
          <p className="dashboard-subtitle">Панель управления логопедическим центром</p>
      </div>
      
      <div className="dashboard-content">
          {/* Статистика */}
          <div className="dashboard-stats">
            <Card className="stat-card">
              <CardHeader>
                <div className="stat-icon">
                  <FaBook />
                </div>
                <CardTitle>Всего занятий</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stat-number">{stats.totalLessons}</div>
                <StatusBadge variant="success" size="sm">Активно</StatusBadge>
              </CardBody>
            </Card>
            
            <Card className="stat-card">
              <CardHeader>
                <div className="stat-icon">
                  <FaUserFriends />
                </div>
                <CardTitle>Детей</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stat-number">{stats.totalStudents}</div>
                <StatusBadge variant="info" size="sm">Зарегистрировано</StatusBadge>
              </CardBody>
            </Card>
            
            <Card className="stat-card">
              <CardHeader>
                <div className="stat-icon">
                  <FaChalkboardTeacher />
                </div>
                <CardTitle>Логопедов</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stat-number">{stats.totalTeachers}</div>
                <StatusBadge variant="warning" size="sm">Работают</StatusBadge>
              </CardBody>
            </Card>
            
            <Card className="stat-card">
              <CardHeader>
                <div className="stat-icon">
                  <FaClock />
                </div>
                <CardTitle>Занятий сегодня</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stat-number">{stats.todayLessons}</div>
                <StatusBadge variant="primary" size="sm">Сегодня</StatusBadge>
              </CardBody>
            </Card>
          </div>

          {/* Графики */}
          <div className="dashboard-charts">
            <div className="chart-row">
              <Card className="chart-card">
                <CardHeader>
                  <CardTitle>Занятия по дням недели</CardTitle>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.lessonsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="lessons" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
              
              <Card className="chart-card">
                <CardHeader>
                  <CardTitle>Занятия по статусам</CardTitle>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.lessonsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.lessonsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
            
            <div className="chart-row">
              <Card className="chart-card full-width">
                <CardHeader>
                  <CardTitle>Дети по месяцам</CardTitle>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.studentsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="#28a745" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="dashboard-actions">
            <h2>Быстрые действия</h2>
            <div className="actions-grid">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card key={index} className="action-card">
                    <CardHeader>
                      <div 
                        className="action-icon" 
                        style={{ backgroundColor: action.color }}
                      >
                        <IconComponent />
                      </div>
                      <CardTitle>{action.title}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="action-description">{action.description}</p>
                    </CardBody>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={{ borderColor: action.color, color: action.color }}
                        onClick={() => handleQuickAction(action)}
                      >
                        Открыть
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Последние занятия */}
          <div className="dashboard-recent">
            <h2>Последние занятия</h2>
            <Card>
              <CardHeader>
                <CardTitle>Расписание на сегодня</CardTitle>
              </CardHeader>
              <CardBody>
                <Table
                  data={[
                    {
                      time: '09:00 - 10:00',
                      title: 'Постановка звука "Р"',
                      location: 'Кабинет 101 • Индивидуальное',
                      status: 'Запланирован'
                    },
                    {
                      time: '10:30 - 11:30',
                      title: 'Развитие речи',
                      location: 'Кабинет 102 • Группа A',
                      status: 'В процессе'
                    },
                    {
                      time: '14:00 - 15:00',
                      title: 'Артикуляционная гимнастика',
                      location: 'Кабинет 103 • Группа B',
                      status: 'Завершен'
                    }
                  ]}
                  columns={[
                    { key: 'time', title: 'Время', width: '120px' },
                    { key: 'title', title: 'Название', width: '200px' },
                    { key: 'location', title: 'Место', width: '200px' },
                    { 
                      key: 'status', 
                      title: 'Статус', 
                      width: '120px',
                      render: (value) => (
                        <StatusBadge 
                          variant={value === 'Завершен' ? 'success' : value === 'В процессе' ? 'warning' : 'info'}
                        >
                          {value || 'Неизвестно'}
                        </StatusBadge>
                      )
                    }
                  ]}
                />
              </CardBody>
        </Card>
      </div>
        </div>
      </div>
      
      {/* Модальное окно */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>
          <h3>{selectedAction?.title}</h3>
        </ModalHeader>
        <ModalBody>
          <p>{selectedAction?.description}</p>
          <p>Выберите действие для продолжения:</p>
          <div className="modal-actions">
            <Button variant="primary" size="sm">
              Продолжить
            </Button>
            <Button variant="outline" size="sm">
              Отмена
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Закрыть
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

export default Dashboard;
