import { useMemo } from 'react';

export const useTeacherSearch = (teachers, searchTerm, getTeacherFullName) => {
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) {
      return teachers;
    }
    const search = searchTerm.toLowerCase();
    return teachers.filter(teacher => {
      const fullName = getTeacherFullName(teacher).toLowerCase();
      const email = (teacher.email || '').toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
  }, [teachers, searchTerm, getTeacherFullName]);

  return filteredTeachers;
};

