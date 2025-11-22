import React from 'react';
import { Card, Button, Input } from '../ui';

const StudentModal = ({
  title,
  onClose,
  children,
  footer,
  variant = 'primary',
  headerContent = null,
}) => (
  <div className="student-modal-overlay">
    <div className="student-modal-portal">
      <Card className={`student-modal-card student-modal-card--${variant}`}>
        <div className="student-modal-header">
          <div className="student-modal-header-top">
            <h2>{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="student-modal-close"
            >
              ✕
            </Button>
          </div>
          {headerContent && (
            <div className="student-modal-header-content">{headerContent}</div>
          )}
        </div>
        <div className="student-modal-body">{children}</div>
        {footer && <div className="student-modal-footer">{footer}</div>}
      </Card>
    </div>
  </div>
);

export const StudentFormModal = ({
  mode = 'create',
  title,
  formData,
  onChange,
  onSubmit,
  onClose,
}) => {
  const submitLabel =
    mode === 'edit' ? 'Сохранить изменения' : 'Добавить студента';

  return (
    <StudentModal
      title={title}
      onClose={onClose}
      variant="primary"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </>
      }
    >
      <div className="student-modal-form">
        <div className="form-group">
          <label>
            Фамилия <span className="required">*</span>
          </label>
          <Input
            type="text"
            placeholder="Введите фамилию"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            Имя <span className="required">*</span>
          </label>
          <Input
            type="text"
            placeholder="Введите имя"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Отчество</label>
          <Input
            type="text"
            placeholder="Введите отчество"
            value={formData.middleName}
            onChange={(e) => onChange('middleName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Возраст</label>
          <Input
            type="number"
            placeholder="Введите возраст"
            value={formData.age}
            onChange={(e) => onChange('age', e.target.value)}
          />
        </div>
      </div>
    </StudentModal>
  );
};

export const StudentDetailsModal = ({ student, onClose }) => {
  const fullName = [student.lastName, student.firstName, student.middleName]
    .filter(Boolean)
    .join(' ');

  return (
    <StudentModal
      title="Информация о студенте"
      onClose={onClose}
      variant="success"
      headerContent={
        <table className="student-modal-header-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Возраст</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{student.id}</td>
              <td>{fullName || 'Не указано'}</td>
              <td>{student.age || 'Не указан'}</td>
            </tr>
          </tbody>
        </table>
      }
    >
    </StudentModal>
  );
};

export default StudentModal;

