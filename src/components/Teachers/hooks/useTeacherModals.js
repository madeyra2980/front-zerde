import { useState } from 'react';

const initialFormData = {
  name: '',
  surname: '',
  lastname: '',
  email: '',
  phone: '',
  subjectId: ''
};

export const useTeacherModals = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState(initialFormData);
  const [editTeacher, setEditTeacher] = useState(initialFormData);

  const handleCreateTeacher = () => {
    setShowCreateForm(true);
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsForm(true);
  };

  const handleEditTeacher = (teacher, subjects, getTeacherName, getTeacherSurname, getTeacherLastname) => {
    setSelectedTeacher(teacher);
    let subjectId = '';
    if (teacher.subjects && teacher.subjects.length > 0) {
      const firstSubject = teacher.subjects[0];
      const subject = subjects.find(s => 
        s.subject_name === firstSubject.subject_name || 
        s.name === firstSubject.name ||
        s.subject_id === firstSubject.subject_id
      );
      subjectId = subject ? (subject.subject_id || subject.id) : '';
    }
    
    setEditTeacher({
      name: getTeacherName(teacher) || '',
      surname: getTeacherSurname(teacher) || '',
      lastname: getTeacherLastname(teacher) || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subjectId: subjectId
    });
    setShowEditForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setNewTeacher(initialFormData);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedTeacher(null);
    setEditTeacher(initialFormData);
  };

  const handleCloseDetailsForm = () => {
    setShowDetailsForm(false);
    setSelectedTeacher(null);
  };

  const handleInputChange = (field, value) => {
    setNewTeacher(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditTeacher(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    showCreateForm,
    showEditForm,
    showDetailsForm,
    selectedTeacher,
    newTeacher,
    editTeacher,
    handleCreateTeacher,
    handleViewDetails,
    handleEditTeacher,
    handleCloseCreateForm,
    handleCloseEditForm,
    handleCloseDetailsForm,
    handleInputChange,
    handleEditInputChange
  };
};

