import type { Assignee, Task } from './task'

/** Тема оформления. Светлая используется по умолчанию. */
export type Theme = 'light' | 'dark'

export interface BoardSettings {
  theme: Theme
}

/** Полный объект данных доски — то, что хранится в localStorage. */
export interface BoardData {
  /** Версия схемы данных. Используется при импорте/экспорте. */
  version: number
  tasks: Task[]
  assignees: Assignee[]
  settings: BoardSettings
}
