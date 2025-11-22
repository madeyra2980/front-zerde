import { useState } from 'react';

const initialFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  age: ''
};

export const useStudentModals = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleCreateStudent = () => {
    setFormData(initialFormData);
    setShowCreateForm(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsForm(true);
  };

  const handleEditStudent = (student) => {
    setFormData({
      firstName: student.firstName || '',
      middleName: student.middleName || '',
      lastName: student.lastName || '',
      age: student.age || ''
    });
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setFormData(initialFormData);
  };

  const handleCloseDetailsForm = () => {
    setShowDetailsForm(false);
    setSelectedStudent(null);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedStudent(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
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
  };
};

