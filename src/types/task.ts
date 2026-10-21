/** Статусы задач. Соответствуют фиксированным колонкам доски. */
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done'

/** Приоритеты задач. */
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  /** Уникальный идентификатор задачи. */
  id: string
  /** Название задачи. Обязательное, не может быть пустым. */
  title: string
  /** Описание задачи. Необязательное. */
  description: string
  /** Текущий статус. Всегда совпадает с колонкой, в которой находится карточка. */
  status: TaskStatus
  /** Приоритет задачи. */
  priority: TaskPriority
  /** ID исполнителя или null, если исполнитель не назначен. */
  assigneeId: string | null
  /** Дата и время создания в ISO 8601. */
  createdAt: string
  /** Срок выполнения в формате YYYY-MM-DD или null. */
  dueDate: string | null
  /** Дата и время завершения в ISO 8601. Заполняется только для задач в статусе done. */
  completedAt: string | null
  /** Список тегов. Без пустых значений и дубликатов. */
  tags: string[]
  /** Позиция карточки внутри своей колонки. */
  position: number
}

/** Исполнитель задачи. Список хранится локально. */
export interface Assignee {
  id: string
  name: string
  /** HEX-цвет аватара, определяется стабильно для исполнителя. */
  color: string
}
