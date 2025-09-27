import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardBody, 
  CardFooter,
  Button, 
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Toast,
  ToastContainer,
  useToast
} from '../ui';
import Navigation from '../Navigation';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaCog,
  FaPlus
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const { info: showToast, toasts, removeToast } = useToast();


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

  return (
    <div className="dashboard">
      <Navigation />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Добро пожаловать, {user?.name || 'Пользователь'}!</h1>
          <p className="dashboard-subtitle">Панель управления логопедическим центром</p>
        </div>
        
        <div className="dashboard-content">
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
