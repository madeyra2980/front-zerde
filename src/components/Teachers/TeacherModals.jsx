import React from 'react';
import { Card, Button, Input, Badge } from '../ui';

const TeacherModal = ({
  title,
  onClose,
  children,
  footer,
  variant = 'primary',
}) => (
  <div className="teacher-modal-overlay">
    <div className="teacher-modal-portal">
      <Card className={`teacher-modal-card teacher-modal-card--${variant}`}>
        <div className="teacher-modal-header">
          <h2>{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="teacher-modal-close"
          >
            ✕
          </Button>
        </div>
        <div className="teacher-modal-body">{children}</div>
        {footer && <div className="teacher-modal-footer">{footer}</div>}
      </Card>
    </div>
  </div>
);

export const TeacherFormModal = ({
  mode = 'create',
  title,
  formData,
  onChange,
  onSubmit,
  onClose,
  subjects = [],
}) => {
  const submitLabel =
    mode === 'edit' ? 'Сохранить изменения' : 'Добавить преподавателя';

  return (
    <TeacherModal
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
      <div className="teacher-modal-form">
        <div className="teacher-modal-grid">
          <div className="form-group">
            <label>
              Фамилия <span className="required">*</span>
            </label>
            <Input
              type="text"
              placeholder="Введите фамилию"
              value={formData.surname}
              onChange={(e) => onChange('surname', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Имя <span className="required">*</span>
            </label>
            <Input
              type="text"
              placeholder="Введите имя"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            Отчество <span className="required">*</span>
          </label>
          <Input
            type="text"
            placeholder="Введите отчество"
            value={formData.lastname}
            onChange={(e) => onChange('lastname', e.target.value)}
          />
        </div>

        <div className="teacher-modal-grid">
          <div className="form-group">
            <label>
              Email <span className="required">*</span>
            </label>
            <Input
              type="email"
              placeholder="Введите email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Телефон</label>
            <Input
              type="tel"
              placeholder="Введите телефон"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            Предмет <span className="required">*</span>
          </label>
          <select
            value={formData.subjectId}
            onChange={(e) => onChange('subjectId', e.target.value)}
            className="subject-select"
          >
            <option value="">Выберите предмет</option>
            {Array.isArray(subjects) &&
              subjects.map((subject) => {
                const id = subject.subject_id ?? subject.id;
                const name =
                  subject?.subject_name || subject?.name || `ID: ${id}`;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
    </TeacherModal>
  );
};

export const TeacherDetailsModal = ({
  teacher,
  onClose,
  getTeacherSurname,
  getTeacherName,
  getTeacherLastname,
  getTeacherSubjects,
  getTeacherAuthorities,
}) => (
  <TeacherModal
    title="Информация о преподавателе"
    onClose={onClose}
    variant="success"
  >
    <div className="teacher-details-modal">
      <div className="teacher-details-avatar">
        <div className="avatar-circle">
          {getTeacherName(teacher)?.[0] || ''}
          {getTeacherSurname(teacher)?.[0] || ''}
        </div>
      </div>
      <div className="teacher-details-grid">
        <div className="detail-item">
          <strong>Фамилия:</strong> {getTeacherSurname(teacher) || 'Не указано'}
        </div>
        <div className="detail-item">
          <strong>Имя:</strong> {getTeacherName(teacher) || 'Не указано'}
        </div>
        <div className="detail-item">
          <strong>Отчество:</strong> {getTeacherLastname(teacher) || 'Не указано'}
        </div>
        <div className="detail-item">
          <strong>Email:</strong> {teacher.email || 'Не указан'}
        </div>
        <div className="detail-item">
          <strong>Предметы:</strong> {getTeacherSubjects(teacher)}
        </div>
        <div className="detail-item">
          <strong>Роли:</strong> {getTeacherAuthorities(teacher)}
        </div>
        <div className="detail-item">
          <strong>Статус пароля:</strong>
          <Badge variant={teacher.passwordTemporary ? 'warning' : 'success'}>
            {teacher.passwordTemporary ? 'Временный' : 'Постоянный'}
          </Badge>
        </div>
      </div>
    </div>
  </TeacherModal>
);

export default TeacherModal;

