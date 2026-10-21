import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { TaskPriority } from '../types/task'

export interface PriorityMeta {
  /** Текстовое обозначение приоритета (не полагаемся только на цвет). */
  label: string
  /** Классы бейджа: фон, текст, обводка. */
  badge: string
  /** Иконка приоритета. */
  icon: typeof ArrowUp
}

/** Визуальное представление приоритетов. */
export const PRIORITIES: Record<TaskPriority, PriorityMeta> = {
  low: {
    label: 'Низкий',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25',
    icon: ArrowDown,
  },
  medium: {
    label: 'Средний',
    badge:
      'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25',
    icon: Minus,
  },
  high: {
    label: 'Высокий',
    badge:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
    icon: ArrowUp,
  },
}

export const PRIORITY_VALUES: TaskPriority[] = ['low', 'medium', 'high']

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === 'string' && (PRIORITY_VALUES as string[]).includes(value)
}
