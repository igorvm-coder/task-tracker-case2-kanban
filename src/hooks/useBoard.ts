import { useCallback, useMemo, useState } from 'react'

import { STORAGE_KEY, isBoardData } from '../lib/storage'
import { createInitialBoardData } from '../lib/seed'
import { createId, moveTask as moveTaskInList, reindexTasks } from '../lib/taskUtils'
import { formToTaskFields } from '../lib/taskValidation'
import type { TaskFormValues } from '../lib/taskValidation'
import type { StorageError } from './useLocalStorage'
import { useLocalStorage } from './useLocalStorage'
import type { BoardData, Theme } from '../types/board'
import type { Task, TaskStatus } from '../types/task'

export interface UseBoardResult {
  tasks: Task[]
  assignees: BoardData['assignees']
  settings: BoardData['settings']
  /** Полный объект данных доски (для экспорта). */
  boardData: BoardData
  /** Ошибка чтения/записи localStorage, если она возникла. */
  storageError: StorageError | null
  dismissStorageError: () => void
  /** Перемещение карточки: меняет колонку (статус) и позицию, пересчитывает позиции. */
  moveTask: (taskId: string, toStatus: TaskStatus, toIndex: number) => void
  /** Создание задачи: появляется в начале колонки «Новая». */
  createTask: (values: TaskFormValues) => void
  /** Обновление полей задачи. Статус и даты завершения не меняются. */
  updateTask: (taskId: string, values: TaskFormValues) => void
  /** Удаление задачи с пересчётом позиций. */
  deleteTask: (taskId: string) => void
  /** Смена темы оформления (сохраняется в settings.theme). */
  setTheme: (theme: Theme) => void
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

  const createTask = useCallback(
    (values: TaskFormValues) => {
      setData((previous) => {
        const newTask: Task = {
          id: createId(),
          ...formToTaskFields(values),
          status: 'backlog',
          createdAt: new Date().toISOString(),
          completedAt: null,
          // Новая задача появляется в начале колонки «Новая».
          position: -1,
        }
        return { ...previous, tasks: reindexTasks([newTask, ...previous.tasks]) }
      })
    },
    [setData],
  )

  const updateTask = useCallback(
    (taskId: string, values: TaskFormValues) => {
      setData((previous) => ({
        ...previous,
        tasks: previous.tasks.map((task) =>
          task.id === taskId ? { ...task, ...formToTaskFields(values) } : task,
        ),
      }))
    },
    [setData],
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      setData((previous) => ({
        ...previous,
        tasks: reindexTasks(previous.tasks.filter((task) => task.id !== taskId)),
      }))
    },
    [setData],
  )

  const setTheme = useCallback(
    (theme: Theme) => {
      setData((previous) => ({ ...previous, settings: { ...previous.settings, theme } }))
    },
    [setData],
  )

  const dismissStorageError = useCallback(() => setStorageError(null), [])

  return useMemo(
    () => ({
      tasks,
      assignees: data.assignees,
      settings: data.settings,
      boardData: data,
      storageError,
      dismissStorageError,
      moveTask,
      createTask,
      updateTask,
      deleteTask,
      setTheme,
      setTasks,
      setData,
    }),
    [
      tasks,
      data,
      storageError,
      dismissStorageError,
      moveTask,
      createTask,
      updateTask,
      deleteTask,
      setTheme,
      setTasks,
      setData,
    ],
  )
}
