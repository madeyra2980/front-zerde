export const useTeacherActions = ({
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
}) => {
  const handleCreateTeacherSubmit = async () => {
    if (!newTeacher.name || !newTeacher.surname || !newTeacher.lastname || !newTeacher.email || !newTeacher.subjectId) {
      warning('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const selectedSubject = subjects.find(subject => subject.subject_id === parseInt(newTeacher.subjectId));
      const teacherData = {
        name: newTeacher.name,
        surname: newTeacher.surname,
        lastname: newTeacher.lastname,
        email: newTeacher.email,
        phone: newTeacher.phone,
        subjectName: selectedSubject ? (selectedSubject.subject_name || '') : ''
      };
      
      await createTeacher(teacherData);
      handleCloseCreateForm();
      success('Преподаватель успешно добавлен');
    } catch (error) {
      showError(`Ошибка: ${error.message}`);
    }
  };

  const handleEditTeacherSubmit = async () => {
    if (!editTeacher.name || !editTeacher.surname || !editTeacher.lastname || !editTeacher.email || !editTeacher.subjectId) {
      warning('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const selectedSubject = subjects.find(subject => subject.subject_id === parseInt(editTeacher.subjectId));
      const teacherData = {
        name: editTeacher.name,
        surname: editTeacher.surname,
        lastname: editTeacher.lastname,
        email: editTeacher.email,
        phone: editTeacher.phone,
        subjectName: selectedSubject ? (selectedSubject.subject_name || '') : ''
      };
      
      const teacherId = selectedTeacher.id 
      
      await editTeacherAction(teacherId, teacherData);
      handleCloseEditForm();
      success('Преподаватель успешно отредактирован');
    } catch (error) {
      if (error.message.includes('403')) {
        showError('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для редактирования преподавателей.');
      } else {
        showError(`Ошибка: ${error.message}`);
      }
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const teacherName = getTeacherFullName(teacher);
    const confirmed = window.confirm(`Вы уверены, что хотите удалить преподавателя "${teacherName}"?`);
    
    if (!confirmed) {
      return;
    }

    try {
      // Пробуем все возможные варианты ID
      const teacherId = teacher.userId || teacher.teacherId || teacher.teacher_id || teacher.id;
      
      console.log('=== ОТЛАДКА УДАЛЕНИЯ ПРЕПОДАВАТЕЛЯ ===');
      console.log('Объект преподавателя:', teacher);
      console.log('Возможные ID:', {
        userId: teacher.userId,
        teacherId: teacher.teacherId,
        teacher_id: teacher.teacher_id,
        id: teacher.id
      });
      console.log('Выбранный ID для удаления:', teacherId);
      
      if (!teacherId) {
        showError('Ошибка: не удалось определить ID преподавателя');
        console.error('Не найден ID в объекте преподавателя');
        return;
      }

      console.log('Отправляем запрос на удаление с ID:', teacherId);
      await deleteTeacherAction(teacherId);
      console.log('Преподаватель успешно удален, список должен быть обновлен');
      // Сообщение об успехе показывается после обновления списка в deleteTeacherAction
      success('Преподаватель успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении преподавателя:', error);
      console.error('Детали ошибки:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      const msg = String(error?.message || 'Ошибка удаления');
      const status = error?.status;
      const looksLikeLinkedLessons =
        msg.toLowerCase().includes('foreign') ||
        msg.toLowerCase().includes('constraint') ||
        msg.toLowerCase().includes('lesson') ||
        msg.toLowerCase().includes('занят') ||
        msg.toLowerCase().includes('связан');

      if (status === 403 || msg.includes('403')) {
        if (looksLikeLinkedLessons) {
          showError('Нельзя удалить преподавателя: есть связанные уроки. Удалите/переназначьте уроки и повторите.');
        } else {
          showError('Удаление отклонено. Недостаточно прав или есть связанные данные. Проверьте роль ADMIN и связанные уроки.');
        }
      } else {
        showError(`Ошибка: ${msg}`);
      }
    }
  };

  return {
    handleCreateTeacherSubmit,
    handleEditTeacherSubmit,
    handleDeleteTeacher
  };
};

