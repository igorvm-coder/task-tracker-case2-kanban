import { COLUMNS } from '../constants/columns'
import type { Task, TaskStatus } from '../types/task'

/** Генерация уникального идентификатора. */
export function createId(prefix = 'task'): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}_${random}`
}

/** Инициалы для аватара исполнителя. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function sortByPosition(a: Task, b: Task): number {
  return a.position - b.position
}

/** Задачи одной колонки в сохранённом порядке. */
export function getColumnTasks(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status).sort(sortByPosition)
}

/** Пересчитывает position внутри каждой колонки и приводит массив к колоночному порядку. */
export function reindexTasks(tasks: Task[]): Task[] {
  const result: Task[] = []
  for (const column of COLUMNS) {
    getColumnTasks(tasks, column.id).forEach((task, index) => {
      result.push({ ...task, position: index })
    })
  }
  return result
}

/**
 * Перемещает задачу в другую колонку/позицию и пересчитывает позиции.
 * Правила даты завершения:
 * — при первом переходе в done completedAt заполняется текущим временем;
 * — при перемещении внутри done completedAt не меняется;
 * — при выходе из done completedAt очищается.
 */
export function moveTask(
  tasks: Task[],
  taskId: string,
  toStatus: TaskStatus,
  toIndex: number,
): Task[] {
  const task = tasks.find((item) => item.id === taskId)
  if (!task) return tasks

  const fromStatus = task.status
  const moved: Task = { ...task, status: toStatus }

  if (toStatus === 'done') {
    if (fromStatus !== 'done') moved.completedAt = new Date().toISOString()
  } else {
    moved.completedAt = null
  }

  const rest = tasks.filter((item) => item.id !== taskId)
  const targetColumn = getColumnTasks(rest, toStatus)
  const index = Math.max(0, Math.min(toIndex, targetColumn.length))
  targetColumn.splice(index, 0, moved)

  const result: Task[] = []
  for (const column of COLUMNS) {
    const columnTasks =
      column.id === toStatus ? targetColumn : getColumnTasks(rest, column.id)
    columnTasks.forEach((item, position) => {
      result.push({ ...item, position })
    })
  }
  return result
}

/** Просрочена ли задача (выполненные задачи просроченными не считаются). */
export function isOverdue(task: Task): boolean {
  if (task.status === 'done' || !task.dueDate) return false
  const due = new Date(`${task.dueDate}T23:59:59`)
  if (Number.isNaN(due.getTime())) return false
  return due.getTime() < Date.now()
}

const MONTHS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

/** Человекочитаемая дата срока: «12 янв» или «12 янв 2027». */
export function formatDueDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  const label = `${date.getDate()} ${MONTHS[date.getMonth()]}`
  return date.getFullYear() === new Date().getFullYear()
    ? label
    : `${label} ${date.getFullYear()}`
}

/** Дата в формате YYYY-MM-DD через указанное количество дней. */
export function isoDateFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
