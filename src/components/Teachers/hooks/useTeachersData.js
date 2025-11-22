import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../service/api';
import { useAuth } from '../../../contexts/AuthContext';

export const useTeachersData = (showError) => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const teachersData = await apiService.getTeachers();
      
      if (Array.isArray(teachersData)) {
        const teachersWithId = teachersData.map((teacher, index) => ({
          ...teacher,
          id: teacher.id || teacher.teacherId || teacher.userId || teacher.teacher_id || index + 1
        }));
        setTeachers(teachersWithId);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      setTeachers([]);
      const msg = String(error?.message || 'Ошибка загрузки преподавателей');
      if (error?.status === 403 || msg.includes('403')) {
        showError('Недостаточно прав для просмотра преподавателей. Войдите как ADMIN.');
      } else {
        showError(`Не удалось загрузить преподавателей: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchSubjects = useCallback(async () => {
    try {
      const subjectsData = await apiService.getSubjects();
      if (Array.isArray(subjectsData)) {
        setSubjects(subjectsData);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      const msg = String(error?.message || 'Ошибка загрузки предметов');
      if (error?.status === 403 || msg.includes('403')) {
        showError('Недостаточно прав для загрузки предметов. Войдите как ADMIN.');
      } else {
        showError(`Не удалось загрузить предметы: ${msg}`);
      }
    }
  }, [showError]);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createTeacher = async (teacherData) => {
    try {
      await apiService.createTeacher(teacherData);
      await fetchTeachers();
    } catch (error) {
      throw error;
    }
  };

  const editTeacher = async (teacherId, teacherData) => {
    try {
      await apiService.editTeacher(teacherId, teacherData);
      await fetchTeachers();
    } catch (error) {
      throw error;
    }
  };

  const deleteTeacher = async (teacherId) => {
    if (!teacherId) {
      throw new Error('ID преподавателя не указан');
    }
    
    // Преобразуем ID в строку, если это число
    const idToSend = String(teacherId);
    console.log('Удаляем преподавателя, ID:', idToSend, 'тип:', typeof teacherId);
    
    try {
      const result = await apiService.deleteTeacher(idToSend);
      console.log('API deleteTeacher успешно выполнен, результат:', result);
      
      // Принудительно обновляем список после удаления
      console.log('Обновляем список преподавателей...');
      await fetchTeachers();
      console.log('Список преподавателей обновлен, текущее количество:', teachers.length);
    } catch (error) {
      console.error('Ошибка при удалении преподавателя:', error);
      console.error('Детали ошибки:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    }
  };

  return {
    teachers,
    loading,
    subjects,
    fetchTeachers,
    fetchSubjects,
    createTeacher,
    editTeacher,
    deleteTeacher
  };
};

