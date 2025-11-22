import { useState } from 'react';

export const useModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
  };

  const updateFormData = (data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleInputChange = (e, monthBounds = null) => {
    const { name, value } = e.target;
    let nextValue = value;

    if ((name === 'lockDateTimeFrom' || name === 'lockDateTimeTo') && value && monthBounds) {
      const selectedDate = new Date(value);
      
      if (!isNaN(selectedDate.getTime())) {
        if (selectedDate < monthBounds.monthStart) {
          nextValue = monthBounds.minValue;
        } else if (selectedDate > monthBounds.monthEnd) {
          nextValue = monthBounds.maxValue;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
  };

  return {
    showModal,
    modalType,
    formData,
    openModal,
    closeModal,
    updateFormData,
    handleInputChange
  };
};

