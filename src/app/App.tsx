import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'

import { KanbanBoard } from '../components/board/KanbanBoard'
import { DeleteTaskDialog } from '../components/task/DeleteTaskDialog'
import { TaskModal } from '../components/task/TaskModal'
import { TopBar } from '../components/layout/TopBar'
import { useBoard } from '../hooks/useBoard'
import { EMPTY_FILTERS, filterTasks, hasActiveFilters } from '../lib/filters'
import type { TaskFilters } from '../lib/filters'
import type { TaskFormValues } from '../lib/taskValidation'
import type { Task } from '../types/task'

const NOTICE_TIMEOUT = 4000

/** Состояние модального окна задачи: создание или редактирование. */
type TaskModalState = { mode: 'create' } | { mode: 'edit'; taskId: string }

export default function App() {
  const {
    tasks,
    assignees,
    storageError,
    dismissStorageError,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
  } = useBoard()

  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS)
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), NOTICE_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [notice])

  const filtersActive = hasActiveFilters(filters)
  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])
  const editingTask = useMemo(
    () =>
      taskModal?.mode === 'edit'
        ? (tasks.find((task) => task.id === taskModal.taskId) ?? null)
        : null,
    [taskModal, tasks],
  )

  const handleCreateTask = useCallback(() => {
    setTaskModal({ mode: 'create' })
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    setTaskModal({ mode: 'edit', taskId: task.id })
  }, [])

  const handleCloseModal = useCallback(() => {
    // Пока открыт диалог подтверждения, модалку задачи закрыть нельзя.
    if (pendingDelete) return
    setTaskModal(null)
  }, [pendingDelete])

  const handleSaveTask = useCallback(
    (values: TaskFormValues) => {
      if (taskModal?.mode === 'edit') {
        if (!editingTask) {
          setTaskModal(null)
          return
        }
        updateTask(editingTask.id, values)
        setNotice('Задача обновлена')
      } else {
        createTask(values)
        setNotice('Задача создана в колонке «Новая»')
      }
      setTaskModal(null)
    },
    [taskModal, editingTask, createTask, updateTask],
  )

  const handleRequestDelete = useCallback((task: Task) => {
    setPendingDelete(task)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) return
    deleteTask(pendingDelete.id)
    setNotice(`Задача «${pendingDelete.title}» удалена`)
    setPendingDelete(null)
    setTaskModal(null)
  }, [pendingDelete, deleteTask])

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <TopBar
        taskCount={tasks.length}
        visibleCount={visibleTasks.length}
        assignees={assignees}
        filters={filters}
        onFiltersChange={setFilters}
        onCreateTask={handleCreateTask}
      />

      {storageError && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1">{storageError.message}</p>
          <button
            type="button"
            onClick={dismissStorageError}
            className="shrink-0 rounded-md p-0.5 text-current transition-colors hover:bg-amber-100 dark:hover:bg-amber-500/20"
            aria-label="Скрыть сообщение"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <main className="min-h-0 flex-1">
        <KanbanBoard
          tasks={visibleTasks}
          assignees={assignees}
          dragDisabled={filtersActive}
          onMoveTask={moveTask}
          onTaskClick={handleTaskClick}
        />
      </main>

      {taskModal && (taskModal.mode === 'create' || editingTask) && (
        <TaskModal
          mode={taskModal.mode}
          task={editingTask ?? undefined}
          assignees={assignees}
          onSave={handleSaveTask}
          onDelete={handleRequestDelete}
          onClose={handleCloseModal}
          dismissible={!pendingDelete}
        />
      )}

      {pendingDelete && (
        <DeleteTaskDialog
          taskTitle={pendingDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {notice && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-ink px-3 py-2 text-[12px] text-canvas shadow-lg"
        >
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="max-w-[80vw] truncate">{notice}</span>
        </div>
      )}
    </div>
  )
}
