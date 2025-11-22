import React, { useMemo } from 'react';
import { Card, Button, Loading, Table, Input, Toast, ToastContainer, useToast } from '../ui';
import Navigation from '../Navigation';
import './Students.css';
import { StudentFormModal, StudentDetailsModal } from './StudentModals';
import {
  useStudentsData,
  useStudentModals,
  useStudentActions,
  useSearch
} from './hooks';

const Students = () => {
  const toastApi = useToast();
  const { toasts, removeToast } = toastApi;
  const success = toastApi.success;
  const showError = toastApi.error;
  const warning = toastApi.warning;

  const {
    students,
    loading,
    createStudent,
    editStudent,
    deleteStudent
  } = useStudentsData(showError, success, warning);

  const {
    showCreateForm,
    showDetailsForm,
    showEditForm,
    selectedStudent,
    formData,
    handleCreateStudent,
    handleViewDetails,
    handleEditStudent,
    handleCloseCreateForm,
    handleCloseDetailsForm,
    handleCloseEditForm,
    handleInputChange
  } = useStudentModals();

  const { handleSubmitCreate, handleSubmitEdit } = useStudentActions({
    formData,
    selectedStudent,
    warning,
    createStudent,
    editStudent,
    handleCloseCreateForm,
    handleCloseEditForm
  });

  const searchFields = useMemo(() => [
    (student) => `${student.firstName} ${student.lastName}`,
    (student) => student.middleName
  ], []);

  const { searchTerm, setSearchTerm, filteredItems: filteredStudents } = useSearch(
    students,
    searchFields
  );

  const columns = [
    {
      key: 'id',
      title: 'ID',
      label: 'ID',
      render: (student) => student.id
    },
    {
      key: 'lastName',
      title: 'Фамилия',
      label: 'Фамилия',
      render: (student) => student.lastName || 'Не указано'
    },
    {
      key: 'firstName',
      title: 'Имя',
      label: 'Имя',
      render: (student) => student.firstName || 'Не указано'
    },
    {
      key: 'middleName',
      title: 'Отчество',
      label: 'Отчество',
      render: (student) => student.middleName || 'Не указано'
    },
    {
      key: 'age',
      title: 'Возраст',
      label: 'Возраст',
      render: (student) => student.age || 'Не указан'
    },
    {
      key: 'actions',
      title: 'Действия',
      label: 'Действия',
      render: (student) => (
        <div className="student-actions">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewDetails(student)}
          >
            Просмотр
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditStudent(student)}
          >
            Редактировать
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => deleteStudent(student)}
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
            <h1>Управление детьми</h1>
            <p>Добавление, редактирование и просмотр информации о детей</p>
          </div>
          <Button onClick={handleCreateStudent}>
            Добавить детей
          </Button>
        </div>

        {showCreateForm && (
          <StudentFormModal
            mode="create"
            title="Добавление нового студента"
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmitCreate}
            onClose={handleCloseCreateForm}
          />
        )}

        {showDetailsForm && selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            onClose={handleCloseDetailsForm}
          />
        )}

        {showEditForm && selectedStudent && (
          <StudentFormModal

            mode="edit"
            title="Редактирование студента"
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmitEdit}
            onClose={handleCloseEditForm}
          />
        )}

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
                    {students.filter(s => s.age && s.age > 0).length}
                  </span>
                  <span className="stat-label">С указанным возрастом</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {students.filter(s => s.middleName).length}
                  </span>
                  <span className="stat-label">С отчеством</span>
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

export default Students;
