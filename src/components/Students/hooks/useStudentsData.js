import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../../../service/api';

export const useStudentsData = (showError, success, warning) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const showErrorRef = useRef(showError);
  const successRef = useRef(success);
  const warningRef = useRef(warning);

  useEffect(() => {
    showErrorRef.current = showError;
    successRef.current = success;
    warningRef.current = warning;
  }, [showError, success, warning]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getChildren();
      const studentsWithId = data.map((student, index) => ({
        ...student,
        id: student.id || index + 1
      }));
      setStudents(studentsWithId);
    } catch (error) {
      console.error('Ошибка загрузки студентов:', error);
      showErrorRef.current('Не удалось загрузить список студентов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const createStudent = async (studentData) => {
    try {
      await apiService.createChild({
        firstName: studentData.firstName,
        middleName: studentData.middleName,
        lastName: studentData.lastName,
        age: parseInt(studentData.age) || 0
      });
      await fetchStudents();
      successRef.current('Студент успешно добавлен');
    } catch (error) {
      console.error('Ошибка создания студента:', error);
      showErrorRef.current('Не удалось добавить студента');
      throw error;
    }
  };

  const editStudent = async (studentId, studentData) => {
    // Диагностика перед редактированием
    console.log('=== ДИАГНОСТИКА ПЕРЕД РЕДАКТИРОВАНИЕМ СТУДЕНТА ===');
    const token = localStorage.getItem('accessToken');
    console.log('Raw token:', token);
    
    try {
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
        const parts = cleanToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Roles/Authorities:', payload.authorities || payload.roles || 'Не найдено');
        }
      }
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
    }
    console.log('Student ID:', studentId);
    console.log('===============================');

    try {
      await apiService.editChild(studentId, {
        firstName: studentData.firstName,
        middleName: studentData.middleName,
        lastName: studentData.lastName,
        age: parseInt(studentData.age) || 0
      });
      await fetchStudents();
      successRef.current('Студент успешно отредактирован');
    } catch (error) {
      console.error('Ошибка редактирования студента:', error);
      if (error.message.includes('403')) {
        showErrorRef.current('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для редактирования студентов.');
      } else {
        showErrorRef.current(`Ошибка: ${error.message}`);
      }
      throw error;
    }
  };

  const deleteStudent = async (student) => {
    const studentName = `${student.firstName} ${student.lastName}`;
    const confirmed = window.confirm(`Вы уверены, что хотите удалить студента "${studentName}"?`);
    
    if (!confirmed) {
      return;
    }

    // Диагностика перед удалением
    const token = localStorage.getItem('accessToken');
    
    try {
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
        const parts = cleanToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Roles/Authorities:', payload.authorities || payload.roles || 'Не найдено');
        }
      }
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
    }
    console.log('Student ID:', student.id);
    console.log('===============================');

    try {
      await apiService.deleteChild(student.id);
      await fetchStudents();
      successRef.current('Студент успешно удален');
    } catch (error) {
      console.error('Ошибка удаления студента:', error);
      if (error.message.includes('403')) {
        showErrorRef.current('Доступ запрещен. Убедитесь, что у вас есть права ADMIN для удаления студентов.');
      } else {
        showErrorRef.current(`Ошибка: ${error.message}`);
      }
      throw error;
    }
  };

  return {
    students,
    loading,
    fetchStudents,
    createStudent,
    editStudent,
    deleteStudent
  };
};

