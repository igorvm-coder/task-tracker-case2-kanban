import type { TaskStatus } from '../types/task'

export interface Column {
  /** Идентификатор статуса — совпадает со значением TaskStatus. */
  id: TaskStatus
  /** Отображаемое название колонки. */
  title: string
  /** Порядок отображения колонки на доске. */
  order: number
  /** Класс цвета акцентной точки в заголовке колонки. */
  accent: string
}

/** Четыре фиксированные колонки доски. Порядок не меняется. */
export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Новая', order: 0, accent: 'bg-slate-400' },
  { id: 'in_progress', title: 'В работе', order: 1, accent: 'bg-sky-500' },
  { id: 'review', title: 'На проверке', order: 2, accent: 'bg-amber-500' },
  { id: 'done', title: 'Готово', order: 3, accent: 'bg-emerald-500' },
]

export const COLUMN_IDS: TaskStatus[] = COLUMNS.map((column) => column.id)

/** Статус, при котором задача считается выполненной. */
export const DONE_STATUS: TaskStatus = 'done'

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (COLUMN_IDS as string[]).includes(value)
}

export function getColumn(status: TaskStatus): Column {
  const column = COLUMNS.find((item) => item.id === status)
  if (!column) throw new Error(`Неизвестный статус колонки: ${status}`)
  return column
}
