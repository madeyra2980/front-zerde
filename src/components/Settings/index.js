import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table, Button, Modal, Input, Toast, ToastContainer } from '../ui';
import './Settings.css';
import Navigation from '../Navigation';
import {
  useToast,
  useModal,
  useSettingsData,
  useCanBlockSlots,
  useMonthBounds,
  useTab,
  useSettingsActions
} from './hooks';

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

const Settings = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Хуки
  const { toasts, addToast, removeToast } = useToast();
  const { activeTab, changeTab } = useTab('subjects');
  const monthBounds = useMonthBounds();
  const canBlockSlots = useCanBlockSlots();
  const {
    showModal,
    modalType,
    formData,
    openModal,
    closeModal,
    handleInputChange
  } = useModal();
  
  const {
    loading,
    setLoading,
    subjects,
    rooms,
    groups,
    lockedSlots,
    fetchSubjects,
    fetchRooms,
    fetchGroups,
    fetchLockedSlots,
    deleteSubject,
    deleteRoom,
    deleteGroup,
    deleteLockedSlot
  } = useSettingsData(addToast);

  const { handleCreate } = useSettingsActions({
    modalType,
    formData,
    monthBounds,
    addToast,
    setLoading,
    fetchSubjects,
    fetchRooms,
    fetchGroups,
    fetchLockedSlots,
    closeModal
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (!isAuthenticated) return;

    switch (activeTab) {
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
        if (rooms.length === 0) {
          fetchRooms();
        }
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  // Обработчики модального окна
  const handleOpenModal = (type) => {
    if (type === 'lockedSlots' && !canBlockSlots()) {
      addToast('У вас нет прав для блокировки слотов. Только администраторы могут выполнять эту операцию.', 'error');
      return;
    }
    openModal(type);
  };

  // Переключение вкладок
  const handleTabChange = (tab) => {
    changeTab(tab);
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
      render: (record) => record?.subject_id || 'Не указано'
    },
    {
      key: 'subject_name',
      title: 'Название',
      render: (record) => record?.subject_name || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (record) => (
        <div className="settings-actions">
          <Button size="sm" variant="outline" onClick={() => console.log('Редактировать предмет', record)}>
            Редактировать
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteSubject(record)}>
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
      render: (record) => record?.room_id || 'Не указано'
    },
    {
      key: 'room_name',
      title: 'Название',
      render: (record) => record?.room_name || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (record) => (
        <div className="settings-actions">
          <Button size="sm" variant="outline" onClick={() => console.log('Редактировать аудиторию', record)}>
            Редактировать
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteRoom(record)}>
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
      render: (record) => record?.group_id || 'Не указано'
    },
    {
      key: 'group_name',
      title: 'Название',
      render: (record) => record?.group_name || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (record) => (
        <div className="settings-actions">
          <Button size="sm" variant="outline" onClick={() => console.log('Редактировать группу', record)}>
            Редактировать
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteGroup(record)}>
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
      render: (record) => record?.lesson_id || 'Не указано'
    },
    {
      key: 'from',
      title: 'Начало блокировки',
      render: (record) => {
        const value = record?.from;
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
      render: (record) => {
        const value = record?.to;
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
      render: (record) => record?.room || 'Не указано'
    },
    {
      key: 'actions',
      title: 'Действия',
      render: (record) => (
        <div className="settings-actions">
          {canBlockSlots() ? (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => deleteLockedSlot(record, canBlockSlots)}
              title="Удалить блокировку слота"
            >
              Удалить
            </Button>
          ) : (
            <span style={{ 
              color: '#666', 
              fontSize: '12px',
              padding: '4px 8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              Нет прав
            </span>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              console.log('=== ОТЛАДКА УДАЛЕНИЯ СЛОТА ===');
              console.log('Слот для удаления:', record);
              console.log('ID слота:', record?.lesson_id);
              if (localStorage.getItem('accessToken')) {
                try {
                  const payload = JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1]));
                  console.log('JWT Payload:', payload);
                } catch (e) {
                  console.error('Ошибка декодирования токена:', e);
                }
              }
              console.log('==============================');
            }}
            style={{ marginLeft: '8px' }}
          >
            🔍
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
    <div className="settings">
      <Navigation />
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-title">
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
          onClose={closeModal}
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
                      onChange={(e) => handleInputChange(e, monthBounds)}
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
                      onChange={(e) => handleInputChange(e, monthBounds)}
                      required
                      size="md"
                      min={monthBounds.minValue}
                      max={monthBounds.maxValue}
                      step={THIRTY_MINUTES_IN_MS / 1000}
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
                      onChange={(e) => handleInputChange(e, monthBounds)}
                      required
                      size="md"
                      min={monthBounds.minValue}
                      max={monthBounds.maxValue}
                      step={THIRTY_MINUTES_IN_MS / 1000}
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
                    onChange={(e) => handleInputChange(e, monthBounds)}
                    placeholder={`Введите название ${modalType === 'subjects' ? 'предмета' : modalType === 'rooms' ? 'аудитории' : 'группы'}`}
                    required
                    size="md"
                  />
                </div>
              )}
            </div>
            
            <div className="settings-modal-actions">
              <Button variant="outline" onClick={closeModal}>
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
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </ToastContainer>
      </div>
    </div>
  );
};

export default Settings;
