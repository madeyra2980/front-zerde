import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table, Button, Modal, Input, Badge, Toast, ToastContainer } from '../ui';
import apiService from '../../service/api';
import './Settings.css';
import Navigation from '../Navigation';

const Settings = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('subjects');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  
  // Данные
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Toast
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Загрузка данных
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubjects();
      console.log('Получены предметы:', data);
      setSubjects(data || []);
    } catch (error) {
      console.error('Ошибка загрузки предметов:', error);
      addToast('Ошибка загрузки предметов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRooms();
      console.log('Получены аудитории:', data);
      setRooms(data || []);
    } catch (error) {
      console.error('Ошибка загрузки аудиторий:', error);
      addToast('Ошибка загрузки аудиторий', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGroups();
      console.log('Получены группы:', data);
      setGroups(data || []);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
      addToast('Ошибка загрузки групп', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubjects();
    }
  }, [isAuthenticated]);

  // Обработчики модального окна
  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Создание новых записей
  const handleCreate = async () => {
    try {
      setLoading(true);
      
      switch (modalType) {
        case 'subjects':
          console.log('Создаем предмет:', formData.subjectName);
          await apiService.createSubject(formData.subjectName);
          await fetchSubjects();
          addToast('Предмет успешно создан');
          break;
        case 'rooms':
          console.log('Создаем аудиторию:', formData.roomName);
          await apiService.createRoom(formData.roomName);
          await fetchRooms();
          addToast('Аудитория успешно создана');
          break;
        case 'groups':
          console.log('Создаем группу:', formData.groupName);
          await apiService.createGroup(formData.groupName);
          await fetchGroups();
          addToast('Группа успешно создана');
          break;
        default:
          break;
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка создания:', error);
      addToast('Ошибка создания записи', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Переключение вкладок
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'subjects':
        fetchSubjects();
        break;
      case 'rooms':
        fetchRooms();
        break;
      case 'groups':
        fetchGroups();
        break;
      default:
        break;
    }
  };

  // Колонки для таблиц
  const subjectColumns = [
    {
      key: 'subject_id',
      title: 'ID',
      width: '80px',
      render: (value, subject) => subject?.subject_id || 'Не указано'
    },
    {
      key: 'subject_name',
      title: 'Название',
      render: (value, subject) => subject?.subject_name || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (value, subject) => (
        <div className="settings-actions">
          <Button size="sm" variant="outline" onClick={() => console.log('Редактировать предмет', subject)}>
            Редактировать
          </Button>
          <Button size="sm" variant="danger" onClick={() => console.log('Удалить предмет', subject)}>
            Удалить
          </Button>
        </div>
      )
    }
  ];

  const roomColumns = [
    {
      key: 'room_id',
      title: 'ID',
      width: '80px',
      render: (value, room) => room?.room_id || 'Не указано'
    },
    {
      key: 'room_name',
      title: 'Название',
      render: (value, room) => room?.room_name || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (value, room) => (
        <div className="settings-actions">
          <Button size="sm" variant="outline" onClick={() => console.log('Редактировать аудиторию', room)}>
            Редактировать
          </Button>
          <Button size="sm" variant="danger" onClick={() => console.log('Удалить аудиторию', room)}>
            Удалить
          </Button>
        </div>
      )
    }
  ];

  const groupColumns = [
    {
      key: 'group_id',
      title: 'ID',
      width: '80px',
      render: (value, group) => group?.group_id || 'Не указано'
    },
    {
      key: 'group_name',
      title: 'Название',
      render: (value, group) => group?.group_name || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (value, group) => (
        <div className="settings-actions">
          <Button size="sm" variant="outline" onClick={() => console.log('Редактировать группу', group)}>
            Редактировать
          </Button>
          <Button size="sm" variant="danger" onClick={() => console.log('Удалить группу', group)}>
            Удалить
          </Button>
        </div>
      )
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="settings-container">
        <div className="settings-unauthorized">
          <h2>Доступ запрещен</h2>
          <p>Для доступа к настройкам необходимо войти в систему</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navigation />
    <div className="settings-container">

      <div className="settings-header">
        <div className="settings-title">
          <div className="settings-icon">⚙️</div>
          <h1>Настройки системы</h1>
        </div>
        <p className="settings-description">
          Управление предметами, аудиториями и группами
        </p>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => handleTabChange('subjects')}
          >
            📚 Предметы
          </button>
          <button
            className={`settings-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => handleTabChange('rooms')}
          >
            🏫 Аудитории
          </button>
          <button
            className={`settings-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => handleTabChange('groups')}
          >
            👥 Группы
          </button>
        </div>

        <div className="settings-tab-content">
          <div className="settings-toolbar">
            <h2>
              {activeTab === 'subjects' && 'Предметы'}
              {activeTab === 'rooms' && 'Аудитории'}
              {activeTab === 'groups' && 'Группы'}
            </h2>
            <Button
              variant="primary"
              onClick={() => handleOpenModal(activeTab)}
            >
              + Добавить
            </Button>
          </div>

          <div className="settings-table">
            {activeTab === 'subjects' && (
              <Table
                data={subjects}
                columns={subjectColumns}
                loading={loading}
                emptyText="Нет предметов"
              />
            )}
            {activeTab === 'rooms' && (
              <Table
                data={rooms}
                columns={roomColumns}
                loading={loading}
                emptyText="Нет аудиторий"
              />
            )}
            {activeTab === 'groups' && (
              <Table
                data={groups}
                columns={groupColumns}
                loading={loading}
                emptyText="Нет групп"
              />
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для создания */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={`Добавить ${modalType === 'subjects' ? 'предмет' : modalType === 'rooms' ? 'аудиторию' : 'группу'}`}
        size="md"
      >
        <div className="settings-modal-content">
          <div className="settings-modal-form">
            <div className="settings-modal-field">
              <label>
                {modalType === 'subjects' ? 'Название предмета' : modalType === 'rooms' ? 'Название аудитории' : 'Название группы'}
                <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>
              </label>
              <Input
                name={modalType === 'subjects' ? 'subjectName' : modalType === 'rooms' ? 'roomName' : 'groupName'}
                value={formData[modalType === 'subjects' ? 'subjectName' : modalType === 'rooms' ? 'roomName' : 'groupName'] || ''}
                onChange={handleInputChange}
                placeholder={`Введите название ${modalType === 'subjects' ? 'предмета' : modalType === 'rooms' ? 'аудитории' : 'группы'}`}
                required
                size="md"
              />
            </div>
          </div>
          
          <div className="settings-modal-actions">
            <Button variant="outline" onClick={handleCloseModal}>
              Отмена
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreate}
              disabled={loading || !formData[modalType === 'subjects' ? 'subjectName' : modalType === 'rooms' ? 'roomName' : 'groupName']}
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>

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
    </>
  );
};

export default Settings;
