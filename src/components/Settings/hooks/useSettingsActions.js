import apiService from '../../../service/api';

const STEP_MINUTES = 30;
const THIRTY_MINUTES_IN_MS = STEP_MINUTES * 60 * 1000;

export const useSettingsActions = ({
  modalType,
  formData,
  monthBounds,
  addToast,
  setLoading,
  fetchSubjects,
  fetchRooms,
  fetchGroups,
  fetchLockedSlots,
  closeModal
}) => {
  const handleCreate = async () => {
    try {
      setLoading(true);
      
      if (modalType === 'lockedSlots') {
        if (!formData.roomName || !formData.lockDateTimeFrom || !formData.lockDateTimeTo) {
          addToast('Все поля обязательны для заполнения', 'error');
          setLoading(false);
          return;
        }

        const now = new Date();
        const startTime = new Date(formData.lockDateTimeFrom);
        
        if (startTime <= now) {
          addToast('Время начала блокировки должно быть в будущем', 'error');
          setLoading(false);
          return;
        }
      }
      
      switch (modalType) {
        case 'subjects':
          console.log('Создаем предмет:', formData.subjectName);
          await apiService.createSubject(formData.subjectName);
          await fetchSubjects();
          addToast('Предмет успешно создан');
          break;
        case 'rooms':
          console.log('Создаем аудиторию:', formData.roomName);
          await apiService.createRoom(formData.roomName);
          await fetchRooms();
          addToast('Аудитория успешно создана');
          break;
        case 'groups':
          console.log('Создаем группу:', formData.groupName);
          await apiService.createGroup(formData.groupName);
          await fetchGroups();
          addToast('Группа успешно создана');
          break;
        case 'lockedSlots':
          console.log('Создаем блокировку слота:', formData);
          
          const startTime = new Date(formData.lockDateTimeFrom);
          const endTime = new Date(formData.lockDateTimeTo);

          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            addToast('Укажите корректный временной промежуток', 'error');
            setLoading(false);
            return;
          }
          
          if (endTime <= startTime) {
            addToast('Время окончания должно быть позже времени начала', 'error');
            setLoading(false);
            return;
          }

          if (
            startTime < monthBounds.monthStart ||
            startTime > monthBounds.monthEnd ||
            endTime < monthBounds.monthStart ||
            endTime > monthBounds.monthEnd
          ) {
            addToast('Можно блокировать только в пределах текущего месяца', 'error');
            setLoading(false);
            return;
          }

          const durationMs = endTime.getTime() - startTime.getTime();
          if (durationMs < THIRTY_MINUTES_IN_MS) {
            addToast('Минимальная длительность блокировки — 30 минут', 'error');
            setLoading(false);
            return;
          }

          if (durationMs % THIRTY_MINUTES_IN_MS !== 0) {
            addToast('Длительность блокировки должна быть кратна 30 минутам', 'error');
            setLoading(false);
            return;
          }
          
          const lockLessonDay = startTime.toISOString().split('T')[0];
          const lockData = {
            lockLessonDay,
            lockDateTimeFrom: startTime.toISOString(),
            lockDateTimeTo: endTime.toISOString(),
            roomName: formData.roomName
          };
          
          console.log('Валидация данных:', {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            roomName: formData.roomName,
            lockLessonDay,
            startTimeValid: !isNaN(startTime.getTime()),
            endTimeValid: !isNaN(endTime.getTime())
          });
          
          console.log('Отправляем данные блокировки:', lockData);
          
          try {
            await apiService.createLockedSlot(lockData);
            await fetchLockedSlots();
            addToast('Блокировка слота успешно создана');
          } catch (error) {
            console.log('Первый формат не сработал, пробуем альтернативный формат...');
            
            const alternativeLockData = {
              lockLessonDay,
              lockDateTimeFrom: startTime.toISOString().split('T')[0] + 'T00:00:00.000Z',
              lockDateTimeTo: endTime.toISOString().split('T')[0] + 'T23:59:59.999Z',
              roomName: formData.roomName
            };
            
            console.log('Пробуем альтернативный формат:', alternativeLockData);
            
            try {
              await apiService.createLockedSlot(alternativeLockData);
              await fetchLockedSlots();
              addToast('Блокировка слота успешно создана (альтернативный формат)');
            } catch (secondError) {
              console.error('Оба формата не сработали:', { first: error.message, second: secondError.message });
              throw secondError;
            }
          }
          break;
        default:
          break;
      }
      
      closeModal();
    } catch (error) {
      console.error('Ошибка создания:', error);
      addToast('Ошибка создания записи', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCreate
  };
};

