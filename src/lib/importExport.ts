import { isTaskStatus } from '../constants/columns'
import { isTaskPriority } from '../constants/priorities'
import { BOARD_DATA_VERSION } from './storage'
import { isDateOnly, normalizeTags } from './taskValidation'
import { reindexTasks } from './taskUtils'
import type { BoardData, Theme } from '../types/board'
import type { Assignee, Task } from '../types/task'

/** Результат разбора импортируемого файла. */
export type ParseBoardResult = { ok: true; data: BoardData } | { ok: false; error: string }

const MAX_ERRORS = 5

/** Имя файла экспорта: kanban-board-YYYY-MM-DD.json. */
export function boardDataFileName(date = new Date()): string {
  return `kanban-board-${date.toISOString().slice(0, 10)}.json`
}

/** Скачивает данные доски как JSON-файл. */
export function exportBoardData(data: BoardData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = boardDataFileName()
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function taskLabel(value: Record<string, unknown> | null, index: number): string {
  const title = value && typeof value.title === 'string' ? value.title.trim() : ''
  if (title) return 'Задача №' + (index + 1) + ' («' + title + '»)'
  return 'Задача №' + (index + 1)
}

function parseTask(value: unknown, index: number, errors: string[]): Task | null {
  if (!isRecord(value)) {
    errors.push('Задача №' + (index + 1) + ': ожидался объект')
    return null
  }

  const record = value
  const label = taskLabel(record, index)

  if (typeof record.id !== 'string' || record.id.trim() === '') {
    errors.push(label + ': отсутствует id')
    return null
  }
  if (typeof record.title !== 'string' || record.title.trim() === '') {
    errors.push(label + ': название не может быть пустым')
    return null
  }
  if (!isTaskStatus(record.status)) {
    errors.push(label + ': недопустимый статус «' + String(record.status) + '»')
    return null
  }
  if (!isTaskPriority(record.priority)) {
    errors.push(label + ': недопустимый приоритет «' + String(record.priority) + '»')
    return null
  }
  if (record.description !== undefined && typeof record.description !== 'string') {
    errors.push(label + ': описание должно быть строкой')
    return null
  }
  if (record.assigneeId !== undefined && record.assigneeId !== null && typeof record.assigneeId !== 'string') {
    errors.push(label + ': некорректное поле исполнителя')
    return null
  }
  if (!isIsoDateTime(record.createdAt)) {
    errors.push(label + ': дата создания не является корректной датой')
    return null
  }
  if (record.dueDate !== undefined && record.dueDate !== null && !isDateOnly(record.dueDate)) {
    errors.push(label + ': срок должен быть датой в формате ГГГГ-ММ-ДД')
    return null
  }
  if (record.completedAt !== undefined && record.completedAt !== null && !isIsoDateTime(record.completedAt)) {
    errors.push(label + ': дата завершения не является корректной датой')
    return null
  }
  if (!Array.isArray(record.tags) || record.tags.some((tag) => typeof tag !== 'string')) {
    errors.push(label + ': теги должны быть массивом строк')
    return null
  }
  if (record.position !== undefined && typeof record.position !== 'number') {
    errors.push(label + ': позиция должна быть числом')
    return null
  }

  const completedAt = record.completedAt === undefined ? null : record.completedAt
  return {
    id: record.id,
    title: record.title.trim(),
    description: typeof record.description === 'string' ? record.description : '',
    status: record.status,
    priority: record.priority,
    assigneeId: record.assigneeId === undefined ? null : record.assigneeId,
    createdAt: record.createdAt,
    dueDate: record.dueDate === undefined || record.dueDate === null ? null : record.dueDate,
    completedAt: completedAt === null ? null : completedAt,
    tags: normalizeTags(record.tags),
    position: typeof record.position === 'number' ? record.position : 0,
  }
}

function parseAssignee(value: unknown, index: number, errors: string[]): Assignee | null {
  if (!isRecord(value)) {
    errors.push('Исполнитель №' + (index + 1) + ': ожидался объект')
    return null
  }
  const record = value
  if (typeof record.id !== 'string' || record.id.trim() === '') {
    errors.push('Исполнитель №' + (index + 1) + ': отсутствует id')
    return null
  }
  if (typeof record.name !== 'string' || record.name.trim() === '') {
    errors.push('Исполнитель №' + (index + 1) + ': отсутствует имя')
    return null
  }
  if (typeof record.color !== 'string' || record.color.trim() === '') {
    errors.push('Исполнитель №' + (index + 1) + ': отсутствует цвет аватара')
    return null
  }
  return { id: record.id, name: record.name.trim(), color: record.color }
}

/**
 * Разбирает и валидирует JSON-файл доски.
 * Не доверяет содержимому: проверяет версию схемы, структуру, типы, даты,
 * уникальность ID и ссылки на исполнителей. Порядок карточек нормализуется.
 */
export function parseBoardData(text: string): ParseBoardResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Файл не является корректным JSON.' }
  }

  if (!isRecord(raw)) {
    return { ok: false, error: 'Ожидался объект данных доски.' }
  }

  if (raw.version !== BOARD_DATA_VERSION) {
    return {
      ok: false,
      error: `Неподдерживаемая версия схемы: ${String(raw.version)}. Ожидается версия ${BOARD_DATA_VERSION}.`,
    }
  }

  const errors: string[] = []

  if (!Array.isArray(raw.assignees)) {
    errors.push('Поле assignees должно быть массивом.')
  }
  if (!Array.isArray(raw.tasks)) {
    errors.push('Поле tasks должно быть массивом.')
  }
  if (errors.length > 0) {
    return { ok: false, error: errors.join(' ') }
  }

  const assignees: Assignee[] = []
  const assigneeIds = new Set<string>()
  ;(raw.assignees as unknown[]).forEach((value, index) => {
    const assignee = parseAssignee(value, index, errors)
    if (!assignee) return
    if (assigneeIds.has(assignee.id)) {
      errors.push('Исполнитель №' + (index + 1) + ': id «' + assignee.id + '» повторяется.')
      return
    }
    assigneeIds.add(assignee.id)
    assignees.push(assignee)
  })

  const tasks: Task[] = []
  const taskIds = new Set<string>()
  ;(raw.tasks as unknown[]).forEach((value, index) => {
    const task = parseTask(value, index, errors)
    if (!task) return
    const tv = isRecord(value) ? value : null
    if (taskIds.has(task.id)) {
      errors.push((taskLabel(tv as Record<string, unknown> | null, index) as string) + ': id «' + task.id + '» повторяется.')
      return
    }
    if (task.assigneeId !== null && !assigneeIds.has(task.assigneeId)) {
      errors.push((taskLabel(tv as Record<string, unknown> | null, index) as string) + ': исполнитель «' + task.assigneeId + '» отсутствует в списке.')
      return
    }
    taskIds.add(task.id)
    tasks.push(task)
  })

  const settingsRaw = isRecord(raw.settings) ? raw.settings : null
  const theme: 'light' | 'dark' = settingsRaw && isTheme((settingsRaw as Record<string, unknown>).theme) ? ((settingsRaw as Record<string, unknown>).theme as 'light' | 'dark') : 'light'

  if (errors.length > 0) {
    const shown = errors.slice(0, MAX_ERRORS)
    const rest = errors.length - shown.length
    return {
      ok: false,
      error: shown.join(' ') + (rest > 0 ? ' И ещё ошибок: ' + rest + '.' : ''),
    }
  }

  return {
    ok: true,
    data: {
      version: BOARD_DATA_VERSION,
      tasks: reindexTasks(tasks),
      assignees,
      settings: { theme },
    },
  }
}
