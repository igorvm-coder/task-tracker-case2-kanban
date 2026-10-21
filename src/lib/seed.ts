import { BOARD_DATA_VERSION } from './storage'
import { isoDateFromNow } from './taskUtils'
import type { BoardData } from '../types/board'
import type { Assignee, Task } from '../types/task'

/**
 * Предопределённый список исполнителей.
 * Список хранится локально; его можно расширить в коде (см. TZ 3.4).
 */
export const DEFAULT_ASSIGNEES: Assignee[] = [
  { id: 'assignee_anna', name: 'Анна Ковалёва', color: '#5e6ad2' },
  { id: 'assignee_dmitry', name: 'Дмитрий Орлов', color: '#f2994a' },
  { id: 'assignee_maria', name: 'Мария Соколова', color: '#27ae60' },
  { id: 'assignee_ilya', name: 'Илья Ветров', color: '#eb5757' },
]

const now = Date.now()
const hoursAgo = (hours: number) => new Date(now - hours * 3_600_000).toISOString()

/** Демонстрационные задачи для первого запуска. */
export const DEMO_TASKS: Task[] = [
  {
    id: 'task_design_storage',
    title: 'Спроектировать схему хранения задач',
    description: 'Описать структуру объектов задач и правила миграции версий.',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 'assignee_anna',
    createdAt: hoursAgo(72),
    dueDate: isoDateFromNow(6),
    completedAt: null,
    tags: ['design', 'backend'],
    position: 0,
  },
  {
    id: 'task_local_storage',
    title: 'Подключить автосохранение в localStorage',
    description: 'Сохранять данные доски после каждого изменения.',
    status: 'backlog',
    priority: 'low',
    assigneeId: 'assignee_dmitry',
    createdAt: hoursAgo(48),
    dueDate: null,
    completedAt: null,
    tags: ['frontend'],
    position: 1,
  },
  {
    id: 'task_dnd',
    title: 'Реализовать drag-and-drop карточек',
    description: 'Перетаскивание между колонками и внутри колонки, мышь и тач.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'assignee_maria',
    createdAt: hoursAgo(30),
    dueDate: isoDateFromNow(1),
    completedAt: null,
    tags: ['frontend', 'dnd'],
    position: 0,
  },
  {
    id: 'task_board_ui',
    title: 'Сверстать Kanban-доску в стиле Linear',
    description: 'Колонки, карточки, аватары, бейджи приоритета.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'assignee_ilya',
    createdAt: hoursAgo(20),
    dueDate: isoDateFromNow(3),
    completedAt: null,
    tags: ['ui'],
    position: 1,
  },
  {
    id: 'task_mobile_review',
    title: 'Проверить адаптивность на смартфонах',
    description: 'Горизонтальная прокрутка доски, сенсорное перетаскивание.',
    status: 'review',
    priority: 'low',
    assigneeId: 'assignee_maria',
    createdAt: hoursAgo(12),
    dueDate: isoDateFromNow(-1),
    completedAt: null,
    tags: ['qa', 'mobile'],
    position: 0,
  },
  {
    id: 'task_project_init',
    title: 'Инициализировать проект на Vite + React + TS',
    description: 'Сборка, Tailwind, линтер, настройка окружения.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'assignee_dmitry',
    createdAt: hoursAgo(96),
    dueDate: isoDateFromNow(-2),
    completedAt: hoursAgo(40),
    tags: ['infra'],
    position: 0,
  },
]

/** Начальное состояние доски для первого запуска. */
export function createInitialBoardData(): BoardData {
  return {
    version: BOARD_DATA_VERSION,
    tasks: DEMO_TASKS.map((task) => ({ ...task, tags: [...task.tags] })),
    assignees: DEFAULT_ASSIGNEES.map((assignee) => ({ ...assignee })),
    settings: { theme: 'light' },
  }
}
