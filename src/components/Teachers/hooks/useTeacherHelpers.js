export const useTeacherHelpers = () => {
  const getTeacherSurname = (teacher) => {
    if (!teacher) return 'Не указано';
    return teacher.surName || teacher.surname || teacher.SurName || '';
  };

  const getTeacherName = (teacher) => {
    if (!teacher) return 'Не указано';
    return teacher.name || teacher.Name || '';
  };

  const getTeacherLastname = (teacher) => {
    if (!teacher) return 'Не указано';
    return teacher.lastName || teacher.lastname || teacher.LastName || '';
  };

  const getTeacherFullName = (teacher) => {
    if (!teacher) return 'Не указано';
    const surname = getTeacherSurname(teacher);
    const name = getTeacherName(teacher);
    const lastname = getTeacherLastname(teacher);
    const parts = [surname, name, lastname].filter(part => part && part.trim() !== '');
    return parts.length > 0 ? parts.join(' ') : 'Не указано';
  };

  const getTeacherSubjects = (teacher) => {
    if (!teacher.subjects || !Array.isArray(teacher.subjects)) return 'Нет предметов';
    return teacher.subjects.map(subject => subject.subject_name || subject.name).join(', ');
  };

  const getTeacherAuthorities = (teacher) => {
    if (!teacher.authorities) return 'Нет ролей';
    if (Array.isArray(teacher.authorities)) {
      return teacher.authorities.map(auth => auth.authority || auth).join(', ');
    }
    return teacher.authorities.authority || teacher.authorities;
  };

  return {
    getTeacherSurname,
    getTeacherName,
    getTeacherLastname,
    getTeacherFullName,
    getTeacherSubjects,
    getTeacherAuthorities
  };
};

