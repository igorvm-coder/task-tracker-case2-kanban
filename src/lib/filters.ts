import type { Task, TaskPriority } from '../types/task'

/** Набор активных фильтров доски. Все фильтры применяются одновременно (AND). */
export interface TaskFilters {
  /** Поиск по названию и описанию, без учёта регистра. */
  query: string
  /** ID исполнителя или null — все исполнители. */
  assigneeId: string | null
  /** Приоритет или null — любой приоритет. */
  priority: TaskPriority | null
  /** Скрыть задачи в статусе done. */
  hideDone: boolean
}

export const EMPTY_FILTERS: TaskFilters = {
  query: '',
  assigneeId: null,
  priority: null,
  hideDone: false,
}

/** Есть ли хотя бы один активный фильтр (влияет и на Drag-and-Drop). */
export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.assigneeId !== null ||
    filters.priority !== null ||
    filters.hideDone
  )
}

/** Проходит ли задача фильтры. */
export function matchesFilters(task: Task, filters: TaskFilters): boolean {
  const query = filters.query.trim().toLowerCase()
  if (query) {
    const haystack = `${task.title}\n${task.description}`.toLowerCase()
    if (!haystack.includes(query)) return false
  }

  if (filters.assigneeId !== null && task.assigneeId !== filters.assigneeId) return false
  if (filters.priority !== null && task.priority !== filters.priority) return false
  if (filters.hideDone && task.status === 'done') return false

  return true
}

/** Задачи, которые должны отображаться на доске с учётом фильтров. */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  if (!hasActiveFilters(filters)) return tasks
  return tasks.filter((task) => matchesFilters(task, filters))
}
