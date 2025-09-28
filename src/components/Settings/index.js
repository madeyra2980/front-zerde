import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table, Button, Modal, Input, Toast, ToastContainer } from '../ui';
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
  const [lockedSlots, setLockedSlots] = useState([]);
  
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
  const fetchSubjects = useCallback(async () => {
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
  }, []);

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

  const fetchLockedSlots = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLockedSlots();
      console.log('Получены заблокированные слоты:', data);
      setLockedSlots(data || []);
    } catch (error) {
      console.error('Ошибка загрузки заблокированных слотов:', error);
      addToast('Ошибка загрузки заблокированных слотов', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Настройки: Текущий пользователь:', user);
      console.log('Настройки: Роль пользователя:', user?.role);
      console.log('Настройки: Тип пользователя:', user?.userType);
      fetchSubjects();
    }
  }, [isAuthenticated, fetchSubjects, user]);

  // Проверка прав доступа для блокировки слотов
  const canBlockSlots = () => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('accessToken');
    
    // Проверяем различные возможные поля роли
    const userRole = user?.role || user?.userType || user?.type;
    const isAdmin = userRole === 'admin' || userRole === 'ADMIN' || userRole === 'administrator';
    
    // Попробуем декодировать токен для получения роли
    let tokenRole = null;
    let tokenAuthorities = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        tokenRole = payload.role;
        tokenAuthorities = payload.authorities;
        console.log('JWT Payload:', payload);
      } catch (e) {
        console.error('Ошибка декодирования токена:', e);
      }
    }
    
    // Проверяем роль из токена
    const isAdminFromToken = tokenAuthorities && (
      tokenAuthorities.includes('ADMIN') || 
      tokenAuthorities.includes('admin') ||
      tokenAuthorities.includes('ROLE_ADMIN')
    );
    
    // Проверяем роль из объекта пользователя (новая структура)
    const userAuthorities = user?.authorities;
    const isAdminFromUser = userAuthorities && (
      userAuthorities === 'ADMIN' ||
      userAuthorities === 'admin' ||
      userAuthorities === 'ROLE_ADMIN' ||
      (typeof userAuthorities === 'string' && userAuthorities.includes('ADMIN'))
    );
    
    console.log('Детальная проверка прав доступа:', {
      token: token ? 'Present' : 'Missing',
      userRole,
      tokenRole,
      tokenAuthorities,
      userAuthorities,
      isAdmin,
      isAdminFromToken,
      isAdminFromUser,
      user,
      finalDecision: isAdmin || isAdminFromToken || isAdminFromUser
    });
    
    return isAdmin || isAdminFromToken || isAdminFromUser;
  };

  // Обработчики модального окна
  const handleOpenModal = (type) => {
    // Проверяем права доступа для блокировки слотов
    if (type === 'lockedSlots' && !canBlockSlots()) {
      addToast('У вас нет прав для блокировки слотов. Только администраторы могут выполнять эту операцию.', 'error');
      return;
    }
    
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

  // Удаление заблокированного слота
  const handleDeleteLockedSlot = async (slot) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту блокировку слота?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteLockedSlot();
      await fetchLockedSlots();
      addToast('Блокировка слота успешно удалена');
    } catch (error) {
      console.error('Ошибка удаления блокировки слота:', error);
      addToast('Ошибка удаления блокировки слота', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Создание новых записей
  const handleCreate = async () => {
    try {
      setLoading(true);
      
      // Дополнительная валидация для заблокированных слотов
      if (modalType === 'lockedSlots') {
        if (!formData.roomName || !formData.lockDateTimeFrom || !formData.lockDateTimeTo) {
          addToast('Все поля обязательны для заполнения', 'error');
          return;
        }
        
        const now = new Date();
        const startTime = new Date(formData.lockDateTimeFrom);
        
        if (startTime <= now) {
          addToast('Время начала блокировки должно быть в будущем', 'error');
          return;
        }
      }
      
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
        case 'lockedSlots':
          console.log('Создаем блокировку слота:', formData);
          
          // Валидация временного диапазона
          const startTime = new Date(formData.lockDateTimeFrom);
          const endTime = new Date(formData.lockDateTimeTo);
          
          if (endTime <= startTime) {
            addToast('Время окончания должно быть позже времени начала', 'error');
            return;
          }
          
          // Преобразуем дату в ISO формат
          const lockData = {
            lockDateTimeFrom: startTime.toISOString(),
            lockDateTimeTo: endTime.toISOString(),
            roomName: formData.roomName
          };
          
          console.log('Валидация данных:', {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            roomName: formData.roomName,
            startTimeValid: !isNaN(startTime.getTime()),
            endTimeValid: !isNaN(endTime.getTime())
          });
          
          console.log('Отправляем данные блокировки:', lockData);
          
          try {
            await apiService.createLockedSlot(lockData);
            await fetchLockedSlots();
            addToast('Блокировка слота успешно создана');
          } catch (error) {
            console.log('Первый формат не сработал, пробуем альтернативный формат...');
            
            // Попробуем альтернативный формат даты (без времени)
            const alternativeLockData = {
              lockDateTimeFrom: startTime.toISOString().split('T')[0] + 'T00:00:00.000Z',
              lockDateTimeTo: endTime.toISOString().split('T')[0] + 'T23:59:59.999Z',
              roomName: formData.roomName
            };
            
            console.log('Пробуем альтернативный формат:', alternativeLockData);
            
            try {
              await apiService.createLockedSlot(alternativeLockData);
              await fetchLockedSlots();
              addToast('Блокировка слота успешно создана (альтернативный формат)');
            } catch (secondError) {
              console.error('Оба формата не сработали:', { first: error.message, second: secondError.message });
              throw secondError; // Бросаем последнюю ошибку
            }
          }
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
      case 'lockedSlots':
        fetchLockedSlots();
        // Также загружаем комнаты для выпадающего списка
        if (rooms.length === 0) {
          fetchRooms();
        }
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
      render: (value, subject) => value?.subject_id || 'Не указано'
    },
    {
      key: 'subject_name',
      title: 'Название',
      render: (value, subject) => value?.subject_name || 'Не указано'
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
      render: (value, room) => value?.room_id || 'Не указано'
    },
    {
      key: 'room_name',
      title: 'Название',
      render: (value, room) => value?.room_name || 'Не указано'
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
      render: (value, group) => value?.group_id || 'Не указано'
    },
    {
      key: 'group_name',
      title: 'Название',
      render: (value, group) => value?.group_name || 'Не указано'
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

  const lockedSlotsColumns = [
    {
      key: 'lesson_id',
      title: 'ID',
      width: '80px',
      render: (value, slot) => value?.lesson_id || 'Не указано'
    },
    {
      key: 'from',
      title: 'Начало блокировки',
      render: (value, slot) => {
        if (!value) return 'Не указано';
        try {
          return new Date(value).toLocaleString('ru-RU');
        } catch (e) {
          return value;
        }
      }
    },
    {
      key: 'to',
      title: 'Конец блокировки',
      render: (value, slot) => {
        if (!value) return 'Не указано';
        try {
          return new Date(value).toLocaleString('ru-RU');
        } catch (e) {
          return value;
        }
      }
    },
    {
      key: 'room',
      title: 'Аудитория',
      render: (value, slot) => value?.room || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (value, slot) => (
        <div className="settings-actions">
          <Button size="sm" variant="danger" onClick={() => handleDeleteLockedSlot(slot)}>
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
          Управление предметами, аудиториями, группами и блокировкой слотов
        </p>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => handleTabChange('subjects')}
          >
             Предметы
          </button>
          <button
            className={`settings-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => handleTabChange('rooms')}
          >
             Аудитории
          </button>
          <button
            className={`settings-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => handleTabChange('groups')}
          >
             Группы
          </button>
          <button
            className={`settings-tab ${activeTab === 'lockedSlots' ? 'active' : ''}`}
            onClick={() => handleTabChange('lockedSlots')}
          >
             Блокировка слотов
          </button>
        </div>

        <div className="settings-tab-content">
          <div className="settings-toolbar">
            <h2>
              {activeTab === 'subjects' && 'Предметы'}
              {activeTab === 'rooms' && 'Аудитории'}
              {activeTab === 'groups' && 'Группы'}
              {activeTab === 'lockedSlots' && 'Заблокированные слоты'}
            </h2>
            <Button
              variant="primary"
              onClick={() => handleOpenModal(activeTab)}
              disabled={activeTab === 'lockedSlots' && !canBlockSlots()}
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
            {activeTab === 'lockedSlots' && (
              <>
                {!canBlockSlots() && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    color: '#856404'
                  }}>
                    ⚠️ <strong>Ограничение доступа:</strong> Только администраторы могут блокировать слоты.
                    Текущая роль: {user?.role || user?.userType || user?.type || 'не определена'}
                    <br />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const token = localStorage.getItem('accessToken');
                        console.log('=== ОТЛАДКА ПОЛЬЗОВАТЕЛЯ ===');
                        console.log('User object:', user);
                        console.log('Token:', token);
                        if (token) {
                          try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            console.log('JWT Payload:', payload);
                            console.log('Authorities:', payload.authorities);
                          } catch (e) {
                            console.error('Ошибка декодирования токена:', e);
                          }
                        }
                        console.log('localStorage keys:', Object.keys(localStorage));
                        console.log('========================');
                      }}
                      style={{ marginTop: '8px' }}
                    >
                      🔍 Отладка пользователя
                    </Button>
                  </div>
                )}
                <Table
                  data={lockedSlots}
                  columns={lockedSlotsColumns}
                  loading={loading}
                  emptyText="Нет заблокированных слотов"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для создания */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={`Добавить ${modalType === 'subjects' ? 'предмет' : modalType === 'rooms' ? 'аудиторию' : modalType === 'groups' ? 'группу' : 'блокировку слота'}`}
        size="md"
      >
        <div className="settings-modal-content">
          <div className="settings-modal-form">
            {modalType === 'lockedSlots' ? (
              <>
                <div className="settings-modal-field">
                  <label>
                    Аудитория
                    <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>
                  </label>
                  <select
                    name="roomName"
                    value={formData.roomName || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Выберите аудиторию</option>
                    {rooms.map(room => (
                      <option key={room.room_id} value={room.room_name}>
                        {room.room_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="settings-modal-field">
                  <label>
                    Начало блокировки
                    <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>
                  </label>
                  <Input
                    name="lockDateTimeFrom"
                    type="datetime-local"
                    value={formData.lockDateTimeFrom || ''}
                    onChange={handleInputChange}
                    required
                    size="md"
                  />
                </div>
                <div className="settings-modal-field">
                  <label>
                    Конец блокировки
                    <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>
                  </label>
                  <Input
                    name="lockDateTimeTo"
                    type="datetime-local"
                    value={formData.lockDateTimeTo || ''}
                    onChange={handleInputChange}
                    required
                    size="md"
                  />
                </div>
              </>
            ) : (
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
            )}
          </div>
          
          <div className="settings-modal-actions">
            <Button variant="outline" onClick={handleCloseModal}>
              Отмена
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreate}
              disabled={loading || (
                modalType === 'lockedSlots' 
                  ? !formData.roomName || !formData.lockDateTimeFrom || !formData.lockDateTimeTo
                  : !formData[modalType === 'subjects' ? 'subjectName' : modalType === 'rooms' ? 'roomName' : 'groupName']
              )}
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
