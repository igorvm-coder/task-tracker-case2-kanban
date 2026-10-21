import { useCallback, useMemo, useState } from 'react'

import { STORAGE_KEY, isBoardData } from '../lib/storage'
import { createInitialBoardData } from '../lib/seed'
import { moveTask as moveTaskInList } from '../lib/taskUtils'
import type { StorageError } from './useLocalStorage'
import { useLocalStorage } from './useLocalStorage'
import type { BoardData } from '../types/board'
import type { Task, TaskStatus } from '../types/task'

export interface UseBoardResult {
  tasks: Task[]
  assignees: BoardData['assignees']
  settings: BoardData['settings']
  /** Ошибка чтения/записи localStorage, если она возникла. */
  storageError: StorageError | null
  dismissStorageError: () => void
  /** Перемещение карточки: меняет колонку (статус) и позицию, пересчитывает позиции. */
  moveTask: (taskId: string, toStatus: TaskStatus, toIndex: number) => void
  /** Прямая замена списка задач (используется при импорте). */
  setTasks: (tasks: Task[]) => void
  setData: (updater: (previous: BoardData) => BoardData) => void
}

/** Состояние доски: данные, сохранение в localStorage и операции над задачами. */
export function useBoard(): UseBoardResult {
  const [storageError, setStorageError] = useState<StorageError | null>(null)

  const [data, setData] = useLocalStorage<BoardData>(
    STORAGE_KEY,
    createInitialBoardData,
    {
      validate: isBoardData,
      onError: setStorageError,
    },
  )

  const tasks = data.tasks

  const moveTask = useCallback(
    (taskId: string, toStatus: TaskStatus, toIndex: number) => {
      setData((previous) => ({
        ...previous,
        tasks: moveTaskInList(previous.tasks, taskId, toStatus, toIndex),
      }))
    },
    [setData],
  )

  const setTasks = useCallback(
    (next: Task[]) => {
      setData((previous) => ({ ...previous, tasks: next }))
    },
    [setData],
  )

  const dismissStorageError = useCallback(() => setStorageError(null), [])

  return useMemo(
    () => ({
      tasks,
      assignees: data.assignees,
      settings: data.settings,
      storageError,
      dismissStorageError,
      moveTask,
      setTasks,
      setData,
    }),
    [tasks, data.assignees, data.settings, storageError, dismissStorageError, moveTask, setTasks, setData],
  )
}
