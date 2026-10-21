import { isTaskStatus } from '../constants/columns'
import { isTaskPriority } from '../constants/priorities'
import type { BoardData } from '../types/board'
import type { Assignee, Task } from '../types/task'

/** Ключ, под которым доска хранится в localStorage. */
export const STORAGE_KEY = 'kanban-board-data'

/** Текущая версия схемы данных доски. */
export const BOARD_DATA_VERSION = 1

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isTaskStatus(value.status) &&
    isTaskPriority(value.priority) &&
    (value.assigneeId === null || typeof value.assigneeId === 'string') &&
    typeof value.createdAt === 'string' &&
    (value.dueDate === null || typeof value.dueDate === 'string') &&
    (value.completedAt === null || typeof value.completedAt === 'string') &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    typeof value.position === 'number'
  )
}

function isAssignee(value: unknown): value is Assignee {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.color === 'string'
  )
}

/** Проверка структуры данных доски. Используется при чтении из хранилища и при импорте. */
export function isBoardData(value: unknown): value is BoardData {
  if (!isRecord(value)) return false
  if (typeof value.version !== 'number') return false
  if (!Array.isArray(value.tasks) || !value.tasks.every(isTask)) return false
  if (!Array.isArray(value.assignees) || !value.assignees.every(isAssignee)) return false
  if (!isRecord(value.settings)) return false
  const theme = value.settings.theme
  return theme === 'light' || theme === 'dark'
}
