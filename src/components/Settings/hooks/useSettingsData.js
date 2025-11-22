import { useState, useCallback } from 'react';
import apiService from '../../../service/api';

export const useSettingsData = (addToast) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lockedSlots, setLockedSlots] = useState([]);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubjects();
      console.log('Получены предметы:', data);
      setSubjects(data || []);
    } catch (error) {
      console.error('Ошибка загрузки предметов:', error);
      addToast('Ошибка загрузки предметов', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getRooms();
      console.log('Получены аудитории:', data);
      setRooms(data || []);
    } catch (error) {
      console.error('Ошибка загрузки аудиторий:', error);
      addToast('Ошибка загрузки аудиторий', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getGroups();
      console.log('Получены группы:', data);
      setGroups(data || []);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
      addToast('Ошибка загрузки групп', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchLockedSlots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getLockedSlots();
      console.log('Получены заблокированные слоты:', data);
      setLockedSlots(data || []);
    } catch (error) {
      console.error('Ошибка загрузки заблокированных слотов:', error);
      addToast('Ошибка загрузки заблокированных слотов', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const deleteSubject = async (subject) => {
    if (!subject || !subject.subject_id) {
      addToast('Ошибка: неверные данные предмета', 'error');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите удалить предмет "${subject.subject_name || subject.subject_id}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Удаляем предмет:', subject);
      console.log('ID предмета:', subject.subject_id);
      await apiService.deleteSubject(subject.subject_id);
      await fetchSubjects();
      addToast('Предмет успешно удален');
    } catch (error) {
      console.error('Ошибка удаления предмета:', error);
      addToast('Ошибка удаления предмета', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (room) => {
    if (!room || !room.room_id) {
      addToast('Ошибка: неверные данные аудитории', 'error');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите удалить аудиторию "${room.room_name || room.room_id}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Удаляем аудиторию:', room);
      console.log('ID аудитории:', room.room_id);
      await apiService.deleteRoom(room.room_id);
      await fetchRooms();
      addToast('Аудитория успешно удалена');
    } catch (error) {
      console.error('Ошибка удаления аудитории:', error);
      addToast('Ошибка удаления аудитории', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (group) => {
    if (!group || !group.group_id) {
      addToast('Ошибка: неверные данные группы', 'error');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите удалить группу "${group.group_name || group.group_id}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Удаляем группу:', group);
      console.log('ID группы:', group.group_id);
      await apiService.deleteGroup(group.group_id);
      await fetchGroups();
      addToast('Группа успешно удалена');
    } catch (error) {
      console.error('Ошибка удаления группы:', error);
      addToast('Ошибка удаления группы', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteLockedSlot = async (slot, canBlockSlots) => {
    if (!canBlockSlots()) {
      addToast('У вас нет прав для удаления блокировки слотов. Только администраторы могут выполнять эту операцию.', 'error');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить эту блокировку слота?')) {
      return;
    }
    console.log('Удаляем слот:', slot);
    console.log('ID слота для удаления:', slot.lesson_id);

    try {
      setLoading(true);
      await apiService.deleteLockedSlot(slot.lesson_id);
      await fetchLockedSlots();
      
      console.log('Количество слотов ПОСЛЕ удаления:', lockedSlots.length);
      console.log('=== УДАЛЕНИЕ ЗАВЕРШЕНО ===');
      
      addToast('Блокировка слота успешно удалена');
    } catch (error) {
      console.error('Ошибка удаления блокировки слота:', error);
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        addToast('Доступ запрещен: у вас недостаточно прав для удаления блокировки слотов. Проверьте, что вы вошли как администратор.', 'error');
      } else {
        addToast('Ошибка удаления блокировки слота', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    subjects,
    rooms,
    groups,
    lockedSlots,
    fetchSubjects,
    fetchRooms,
    fetchGroups,
    fetchLockedSlots,
    deleteSubject,
    deleteRoom,
    deleteGroup,
    deleteLockedSlot
  };
};

