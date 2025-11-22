export const useStudentActions = ({
  formData,
  selectedStudent,
  warning,
  createStudent,
  editStudent,
  handleCloseCreateForm,
  handleCloseEditForm
}) => {
  const handleSubmitCreate = async () => {
    if (!formData.firstName || !formData.lastName) {
      warning('Пожалуйста, заполните обязательные поля');
      return;
    }

    try {
      await createStudent(formData);
      handleCloseCreateForm();
    } catch (error) {
      // Ошибка уже обработана в createStudent
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.firstName || !formData.lastName) {
      warning('Пожалуйста, заполните обязательные поля');
      return;
    }

    try {
      await editStudent(selectedStudent.id, formData);
      handleCloseEditForm();
    } catch (error) {
      // Ошибка уже обработана в editStudent
    }
  };

  return {
    handleSubmitCreate,
    handleSubmitEdit
  };
};

