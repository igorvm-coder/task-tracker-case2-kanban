import type { Task, TaskPriority } from '../types/task'

/** Значения формы задачи (то, что вводит пользователь в модальном окне). */
export interface TaskFormValues {
  title: string
  description: string
  priority: TaskPriority
  /** ID исполнителя или null, если исполнитель не назначен. */
  assigneeId: string | null
  /** Срок в формате YYYY-MM-DD или пустая строка, если срок не задан. */
  dueDate: string
  tags: string[]
}

/** Ошибки валидации формы. Ключ — имя поля. */
export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Строка является корректной датой в формате YYYY-MM-DD. */
export function isDateOnly(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

/**
 * Нормализует список тегов: обрезает пробелы, убирает пустые значения
 * и дубликаты (регистронезависимо, сохраняя первое написание).
 */
export function normalizeTags(tags: string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    const tag = raw.trim()
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(tag)
  }
  return result
}

/** Разбирает строку с тегами, введённую через запятую (или пробел). */
export function parseTagsInput(input: string): string[] {
  return normalizeTags(input.split(/[,\n\t]+/))
}

/** Проверяет форму задачи. Возвращает пустой объект, если всё корректно. */
export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Введите название задачи'
  }

  if (values.dueDate && !isDateOnly(values.dueDate)) {
    errors.dueDate = 'Укажите срок в формате ГГГГ-ММ-ДД'
  }

  return errors
}

/** Значения из формы превращаются в поля задачи (без id/статуса/дат). */
export function formToTaskFields(values: TaskFormValues): Pick<
  Task,
  'title' | 'description' | 'priority' | 'assigneeId' | 'dueDate' | 'tags'
> {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    assigneeId: values.assigneeId,
    dueDate: values.dueDate || null,
    tags: normalizeTags(values.tags),
  }
}

/** Стартовые значения формы для создания новой задачи. */
export function emptyTaskForm(): TaskFormValues {
  return {
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: null,
    dueDate: '',
    tags: [],
  }
}

/** Значения формы, заполненные из существующей задачи. */
export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate ?? '',
    tags: [...task.tags],
  }
}
