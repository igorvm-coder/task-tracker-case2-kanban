import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'

import { KanbanBoard } from '../components/board/KanbanBoard'
import { TopBar } from '../components/layout/TopBar'
import { useBoard } from '../hooks/useBoard'
import type { Task } from '../types/task'

const NOTICE_TIMEOUT = 4000

export default function App() {
  const { tasks, assignees, storageError, dismissStorageError, moveTask } = useBoard()
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), NOTICE_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [notice])

  const handleCreateTask = useCallback(() => {
    setNotice('Создание задач появится на следующем шаге — сейчас работает перетаскивание.')
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    setNotice(`«${task.title}» — редактирование задачи появится на следующем шаге.`)
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <TopBar taskCount={tasks.length} onCreateTask={handleCreateTask} />

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
          tasks={tasks}
          assignees={assignees}
          onMoveTask={moveTask}
          onTaskClick={handleTaskClick}
        />
      </main>

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
