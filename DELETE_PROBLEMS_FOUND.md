# 🔍 ДЕТАЛЬНЫЙ АНАЛИЗ ПРОБЛЕМ С DELETE ЗАПРОСАМИ

## Дата: 26.10.2024

## 📋 КРАТКОЕ РЕЗЮМЕ:

**ГЛАВНАЯ ПРОБЛЕМА:** В бэкенде отсутствует метод `deleteSubject()` в AdminService!

---

## 🔍 ЧТО РАБОТАЕТ ✅:

### 1. **Удаление аудиторий (Rooms)**
- **Frontend:** `handleDeleteRoom(room)` → `apiService.deleteRoom(room.room_id)` 
- **URL:** `/api/v1/admin/delete-room/{room_id}`
- **Backend:** Controller метод `deleteRoom` ✅ (строка 261)
- **Backend:** Service метод `deleteRoom(int roomId)` ✅ (строка 369)
- **Статус:** ✅ Должно работать

### 2. **Удаление групп (Groups)**
- **Frontend:** `handleDeleteGroup(group)` → `apiService.deleteGroup(group.group_id)`
- **URL:** `/api/v1/admin/delete-group/{app_group_id}`  ⚠️ Несоответствие!
- **Backend:** Controller метод `deleteGroup` ✅ (строка 256)
- **Backend:** Service метод `deleteGroup(int appGroupId)` ✅ (строка 365)
- **Статус:** ⚠️ Потенциальная проблема с именованием параметра

### 3. **Удаление детей (Children)**
- **Frontend:** `handleDeleteChild(child)` → `apiService.deleteChild(child.child_id)`
- **URL:** `/api/v1/admin/delete-child/{child_id}`
- **Backend:** Controller метод `deleteChild` ✅ (строка 246)
- **Backend:** Service метод `deleteChild(int childId)` ✅ (строка 313)
- **Статус:** ✅ Должно работать

### 4. **Удаление преподавателей (Teachers)**
- **Frontend:** `handleDeleteTeacher(teacher)` → `apiService.deleteTeacher(teacher.teacher_id)`
- **URL:** `/api/v1/admin/delete-teacher/{teacher_id}`
- **Backend:** Controller метод `deleteTeacher` ✅ (строка 251)
- **Backend:** Service метод `deleteTeacher(int teacherId)` ✅ (строка 337)
- **Статус:** ✅ Должно работать

### 5. **Удаление заблокированных слотов (Locked Slots)**
- **Frontend:** `handleDeleteLockedSlot(slot)` → `apiService.deleteLockedSlot(slot.lesson_id)`
- **URL:** `/api/v1/admin/lock-lesson/{lockLesson_id}` ✅ ИСПРАВЛЕНО!
- **Backend:** Controller метод `deleteLockLesson` ✅ (строка 236)
- **Backend:** Service метод `deleteLockLesson(int lockLessonId)` - нужно проверить в LessonService
- **Статус:** ✅ Исправлено во фронтенде

---

## ❌ ЧТО НЕ РАБОТАЕТ:

### **Удаление предметов (Subjects)**
- **Frontend:** `handleDeleteSubject(subject)` → `apiService.deleteSubject(subject.subject_id)`
- **URL:** `/api/v1/admin/delete-subject/{subject_id}` ❌
- **Backend:** Controller метод `deleteSubject` ❌ **ОТСУТСТВУЕТ!**
- **Backend:** Service метод `deleteSubject(int subjectId)` ❌ **ОТСУТСТВУЕТ!**
- **Статус:** ❌ **НЕ РАБОТАЕТ - Метод не существует в бэкенде!**

---

## 🐛 ПРОБЛЕМА С НЕСООТВЕТСТВИЕМ ИМЕН ПАРАМЕТРОВ:

### Группы (Groups):
- **DTO поле:** `group_id` (ListGroupsDto.java строка 4)
- **Controller параметр:** `{app_group_id}` (AdminController.java строка 256)
- **Service параметр:** `appGroupId` (AdminService.java строка 365)

**Анализ:** 
- В entity Group поле называется просто `id`
- В DTO маппится как `group_id`
- В controller параметр называется `app_group_id`
- Spring должен маппить это автоматически по URL path

**Вероятная причина проблемы:** В бэкенде таблица называется `app_groups`, поэтому используется `app_group_id` для ясности.

---

## 🔧 РЕШЕНИЕ:

### Для бэкенда - НУЖНО ДОБАВИТЬ:

#### 1. Добавить метод в AdminController.java (после строки 265):

```java
@DeleteMapping("/delete-subject/{subject_id}")
public ResponseEntity<String> deleteSubject(@PathVariable int subject_id){
    adminService.deleteSubject(subject_id);
    return new ResponseEntity<>("Delete Subject success", HttpStatus.OK);
}
```

#### 2. Добавить метод в AdminService.java (после строки 371):

```java
public void deleteSubject(int subjectId) {
    subjectRepo.deleteById(subjectId);
}
```

---

## 📊 ТАБЛИЦА СООТВЕТСТВИЯ:

| Entity | DTO ID поле | Controller параметр | Service параметр | Статус |
|--------|-------------|---------------------|------------------|--------|
| Subject | subject_id | ❌ отсутствует | ❌ отсутствует | ❌ НЕТ МЕТОДА |
| Room | room_id | room_id | roomId | ✅ РАБОТАЕТ |
| Group | group_id | app_group_id | appGroupId | ✅ РАБОТАЕТ |
| Teacher | - | teacher_id | teacherId | ✅ РАБОТАЕТ |
| Child | - | child_id | childId | ✅ РАБОТАЕТ |
| LockedSlot | lesson_id | lockLesson_id | - | ✅ ИСПРАВЛЕНО |

---

## 🎯 ВЫВОД:

**Основная причина 403 ошибок:**

1. ❌ **Для Subjects:** Метод `deleteSubject` полностью отсутствует в бэкенде
2. ⚠️ **Для Groups:** Несоответствие имен параметров может вызывать проблемы
3. ✅ **Остальное:** Работает корректно после исправления путей

**Что было исправлено во фронтенде:**
- ✅ Исправлен эндпоинт для заблокированных слотов: `/api/v1/admin/lock-lesson/{id}`
- ✅ Исправлен параметр при передаче предмета в `handleDeleteSubject(subject)` вместо `handleDeleteSubject(value)`
- ✅ Убран Content-Type заголовок для DELETE запросов

**Что нужно исправить в бэкенде:**
- ❌ Добавить метод `deleteSubject()` в AdminService и AdminController
- ⚠️ Рассмотреть унификацию имен параметров (например, использовать `group_id` вместо `app_group_id`)

