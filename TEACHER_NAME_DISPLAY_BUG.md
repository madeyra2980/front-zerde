# Ошибка отображения имени преподавателя: "Мадияр null null"

## Описание проблемы

При удалении преподавателя в диалоговом окне отображается некорректное имя: **"Мадияр null null"** вместо полного ФИО.

## Причина проблемы

### 1. ❌ Неправильное формирование имени в handleDeleteTeacher

**Расположение:** `front-zerde/src/components/Teachers/index.js:304`

**Проблема:**
- В шаблонной строке используются поля `teacher.surName` и `teacher.lastName` без проверки на `null`/`undefined`
- Если эти поля равны `null` (что возможно, если в базе данных они NULL), JavaScript преобразует их в строку `"null"` в шаблонной строке
- Результат: `"Мадияр null null"` вместо `"Мадияр"` или корректного ФИО

**Код проблемы:**
```javascript
// Строка 304 - НЕПРАВИЛЬНО
const teacherName = `${teacher.name} ${teacher.surName} ${teacher.lastName}`;
// Если surName = null и lastName = null
// Результат: "Мадияр null null"
```

**Сравнение с правильным кодом:**
```javascript
// Строка 351 - ПРАВИЛЬНО (используется в фильтрации)
const fullName = `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`.toLowerCase();

// Строка 377 - ПРАВИЛЬНО (используется в колонке таблицы)
render: (teacher) => `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`
```

### 2. ⚠️ Проблема на бэкенде: NULL значения в базе данных

**Расположение:** `zerde/src/main/java/kidd/house/zerde/service/AdminService.java:223-226`

**Проблема:**
- Метод `toDtoTeachers()` передает значения напрямую из `User` entity:
  ```java
  return new ListTeachersDto(
      user.getName(),      // Может быть null
      user.getSurName(),   // Может быть null
      user.getLastName(),  // Может быть null
      // ...
  );
  ```
- Если в базе данных поля `surname` или `lastname` содержат NULL, они передаются как `null` в JSON
- JavaScript получает `null` значения, которые нужно корректно обрабатывать

**Связанные файлы:**
- `zerde/src/main/java/kidd/house/zerde/service/AdminService.java` (строка 223-226)
- `zerde/src/main/java/kidd/house/zerde/model/entity/User.java`

---

## Детали проблемы

### Почему появляется "null" как строка?

В JavaScript шаблонные строки автоматически преобразуют значения в строки:

```javascript
const name = "Мадияр";
const surName = null;
const lastName = null;

// НЕПРАВИЛЬНО:
const result = `${name} ${surName} ${lastName}`;
// Результат: "Мадияр null null"

// ПРАВИЛЬНО:
const result = `${name || ''} ${surName || ''} ${lastName || ''}`.trim();
// Результат: "Мадияр"
```

### Откуда берутся NULL значения?

1. **При создании преподавателя:**** Если поле не заполнено, оно может быть сохранено как NULL
2. **В базе данных:** Поля могут быть необязательными (nullable)
3. **При миграции:** Старые данные могут иметь NULL значения

---

## Исправление

### Решение 1: Исправить формирование имени (Рекомендуется)

**Файл:** `front-zerde/src/components/Teachers/index.js`

**Исправление строки 304 (handleDeleteTeacher):**
```javascript
// БЫЛО:
const teacherName = `${teacher.name} ${teacher.surName} ${teacher.lastName}`;

// ДОЛЖНО БЫТЬ:
const teacherName = `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`.trim();
```

**Исправление строки 615 (детали преподавателя):**
```javascript
// БЫЛО:
<strong>ФИО:</strong> {selectedTeacher.name} {selectedTeacher.surName} {selectedTeacher.lastName}

// ДОЛЖНО БЫТЬ:
<strong>ФИО:</strong> {[selectedTeacher.name, selectedTeacher.surName, selectedTeacher.lastName]
  .filter(part => part != null && part.trim() !== '')
  .join(' ') || 'Не указано'}
```

**Или создать вспомогательную функцию:**
```javascript
// Добавить перед handleDeleteTeacher
const getTeacherFullName = (teacher) => {
  const parts = [
    teacher.name,
    teacher.surName,
    teacher.lastName
  ].filter(part => part != null && part.trim() !== '');
  
  return parts.join(' ') || 'Без имени';
};

// Использовать в handleDeleteTeacher:
const teacherName = getTeacherFullName(teacher);
```

### Решение 2: Исправить на бэкенде (Дополнительно)

**Файл:** `zerde/src/main/java/kidd/house/zerde/service/AdminService.java`

**Исправление метода `toDtoTeachers()`:**
```java
private ListTeachersDto toDtoTeachers(User user) {
    List<ListSubjectsDto> subjectDtos = user.getSubjects().stream()
            .map(subject -> new ListSubjectsDto(1, subject.getName()))
            .toList();
    return new ListTeachersDto(
            user.getName() != null ? user.getName() : "",
            user.getSurName() != null ? user.getSurName() : "",
            user.getLastName() != null ? user.getLastName() : "",
            user.getEmail(),
            user.getAuthorities(),
            user.isPasswordTemporary(),
            subjectDtos
    );
}
```

**Или использовать Optional:**
```java
private ListTeachersDto toDtoTeachers(User user) {
    List<ListSubjectsDto> subjectDtos = user.getSubjects().stream()
            .map(subject -> new ListSubjectsDto(1, subject.getName()))
            .toList();
    return new ListTeachersDto(
            Optional.ofNullable(user.getName()).orElse(""),
            Optional.ofNullable(user.getSurName()).orElse(""),
            Optional.ofNullable(user.getLastName()).orElse(""),
            user.getEmail(),
            user.getAuthorities(),
            user.isPasswordTemporary(),
            subjectDtos
    );
}
```

### Решение 3: Исправить базу данных (Долгосрочно)

Убедиться, что в таблице `users` поля `surname` и `lastname` не могут быть NULL, или установить значения по умолчанию.

---

## Дополнительные места для проверки

### Места, где уже правильно обрабатываются null:

1. ✅ **Строка 351:** Фильтрация преподавателей
   ```javascript
   const fullName = `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`.toLowerCase();
   ```

2. ✅ **Строка 377:** Отображение в таблице
   ```javascript
   render: (teacher) => `${teacher.name || ''} ${teacher.surName || ''} ${teacher.lastName || ''}`
   ```

### Места, которые нужно исправить:

1. ❌ **Строка 304:** Формирование имени для диалога удаления
   ```javascript
   const teacherName = `${teacher.name} ${teacher.surName} ${teacher.lastName}`;
   ```
   **Проблема:** Показывает "null" если поля null

2. ❌ **Строка 615:** Отображение в деталях преподавателя
   ```javascript
   <strong>ФИО:</strong> {selectedTeacher.name} {selectedTeacher.surName} {selectedTeacher.lastName}
   ```
   **Проблема:** В JSX null значения отображаются как "null" текст

---

## Пример правильной реализации

```javascript
// Вспомогательная функция для получения полного имени
const formatTeacherName = (teacher) => {
  if (!teacher) return 'Неизвестный';
  
  const parts = [
    teacher.name,
    teacher.surName,
    teacher.lastName
  ]
    .filter(part => part != null && String(part).trim() !== '')
    .map(part => String(part).trim());
  
  return parts.length > 0 ? parts.join(' ') : 'Без имени';
};

// Использование в handleDeleteTeacher:
const handleDeleteTeacher = async (teacher) => {
  const teacherName = formatTeacherName(teacher);
  const confirmed = window.confirm(`Вы уверены, что хотите удалить преподавателя "${teacherName}"?`);
  // ...
};
```

---

## Тестовые сценарии

Проверить следующие случаи:
1. ✅ Преподаватель с полным ФИО: "Иванов Иван Иванович"
2. ❌ Преподаватель только с именем: "Мадияр" (текущий баг)
3. ✅ Преподаватель с именем и фамилией: "Иванов Иван"
4. ❌ Преподаватель с null значениями (не должен показывать "null")

---

## Дата обнаружения
2024-12-19

## Приоритет
🟡 СРЕДНИЙ - Визуальная проблема, не критична для функциональности, но влияет на UX

