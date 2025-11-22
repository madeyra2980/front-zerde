import React, { useState } from 'react';
import { Card, Button, Loading, Table, Badge, Input, Toast, ToastContainer, useToast } from '../ui';
import Navigation from '../Navigation';
import './Teachers.css';
import { TeacherFormModal, TeacherDetailsModal } from './TeacherModals';
import {
  useTeachersData,
  useTeacherModals,
  useTeacherActions,
  useTeacherHelpers,
  useTeacherSearch
} from './hooks';

const Teachers = () => {
  const toastApi = useToast();
  const { toasts, removeToast } = toastApi;
  const success = toastApi.success;
  const showError = toastApi.error;
  const warning = toastApi.warning;

  const {
    teachers,
    loading,
    subjects,
    createTeacher,
    editTeacher: editTeacherAction,
    deleteTeacher: deleteTeacherAction
  } = useTeachersData(showError);

  const {
    getTeacherSurname,
    getTeacherName,
    getTeacherLastname,
    getTeacherFullName,
    getTeacherSubjects,
    getTeacherAuthorities
  } = useTeacherHelpers();

  const {
    showCreateForm,
    showEditForm,
    showDetailsForm,
    selectedTeacher,
    newTeacher,
    editTeacher,
    handleCreateTeacher,
    handleViewDetails,
    handleEditTeacher: handleEditTeacherModal,
    handleCloseCreateForm,
    handleCloseEditForm,
    handleCloseDetailsForm,
    handleInputChange,
    handleEditInputChange
  } = useTeacherModals();

  const { handleCreateTeacherSubmit, handleEditTeacherSubmit, handleDeleteTeacher } = useTeacherActions({
    newTeacher,
    editTeacher,
    selectedTeacher,
    subjects,
    warning,
    success,
    showError,
    createTeacher,
    editTeacherAction,
    deleteTeacherAction,
    handleCloseCreateForm,
    handleCloseEditForm,
    getTeacherFullName
  });

  const [searchTerm, setSearchTerm] = useState('');
  const filteredTeachers = useTeacherSearch(teachers, searchTerm, getTeacherFullName);

  const handleEditTeacher = (teacher) => {
    handleEditTeacherModal(teacher, subjects, getTeacherName, getTeacherSurname, getTeacherLastname);
  };

  const columns = [
    {
      key: 'id',
      title: 'ID',
      render: (teacher) => teacher.id
    },
    {
      key: 'surname',
      title: 'Фамилия',
      render: (teacher) => getTeacherSurname(teacher) || 'Не указано'
    },
    {
      key: 'name',
      title: 'Имя',
      render: (teacher) => getTeacherName(teacher) || 'Не указано'
    },
    {
      key: 'lastname',
      title: 'Отчество',
      render: (teacher) => getTeacherLastname(teacher) || 'Не указано'
    },
    {
      key: 'email',
      title: 'Email',
      render: (teacher) => teacher.email || 'Не указан'
    },
    {
      key: 'subjects',
      title: 'Предметы',
      render: (teacher) => (
        <div className="teacher-subjects">
          {getTeacherSubjects(teacher)}
        </div>
      )
    },
    {
      key: 'authorities',
      title: 'Роли',
      render: (teacher) => (
        <div className="teacher-authorities">
          {teacher.authorities?.map((auth, index) => (
            <Badge key={index} variant="info" size="sm">
              {auth.authority}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'passwordTemporary',
      title: 'Статус пароля',
      render: (teacher) => (
        <Badge variant={teacher.passwordTemporary ? "warning" : "success"}>
          {teacher.passwordTemporary ? 'Временный' : 'Постоянный'}
        </Badge>
      )
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditTeacher(teacher)}
          >
            Редактировать
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteTeacher(teacher)}
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
          <Button onClick={handleCreateTeacher}>
            Добавить преподавателя
          </Button>
        </div>

        {showCreateForm && (
          <TeacherFormModal
            mode="create"
            title="Добавление нового преподавателя"
            formData={newTeacher}
            onChange={handleInputChange}
            onSubmit={handleCreateTeacherSubmit}
            onClose={handleCloseCreateForm}
            subjects={subjects}
          />
        )}

        {showDetailsForm && selectedTeacher && (
          <TeacherDetailsModal
            teacher={selectedTeacher}
            onClose={handleCloseDetailsForm}
            getTeacherSurname={getTeacherSurname}
            getTeacherName={getTeacherName}
            getTeacherLastname={getTeacherLastname}
            getTeacherSubjects={getTeacherSubjects}
            getTeacherAuthorities={getTeacherAuthorities}
          />
        )}

        {showEditForm && selectedTeacher && (
          <TeacherFormModal
            mode="edit"
            title="Редактирование преподавателя"
            formData={editTeacher}
            onChange={handleEditInputChange}
            onSubmit={handleEditTeacherSubmit}
            onClose={handleCloseEditForm}
            subjects={subjects}
          />
        )}

        <div className="teachers-content">
          <Card className="teachers-card">
            <div className="teachers-toolbar">
              <div className="search-container">
                <Input
                  type="text"
                  placeholder="Поиск по ФИО или email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="teachers-stats">
                <div className="stat-item">
                  <span className="stat-number">{Array.isArray(teachers) ? teachers.length : 0}</span>
                  <span className="stat-label">Всего преподавателей</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {Array.isArray(teachers) ? teachers.filter(t => t.subjects && t.subjects.length > 0).length : 0}
                  </span>
                  <span className="stat-label">С предметами</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {Array.isArray(teachers) ? teachers.filter(t => !t.passwordTemporary).length : 0}
                  </span>
                  <span className="stat-label">С постоянным паролем</span>
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

export default Teachers;
