import { useCallback, useMemo } from 'react'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'

import { COLUMNS, getColumn, isTaskStatus } from '../../constants/columns'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { getColumnTasks } from '../../lib/taskUtils'
import type { Assignee, Task, TaskStatus } from '../../types/task'
import { DragOverlayCard } from './DragOverlayCard'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  tasks: Task[]
  assignees: Assignee[]
  onMoveTask: (taskId: string, toStatus: TaskStatus, toIndex: number) => void
  onTaskClick: (task: Task) => void
}

/** Kanban-доска с четырьмя колонками и drag-and-drop. */
export function KanbanBoard({
  tasks,
  assignees,
  onMoveTask,
  onTaskClick,
}: KanbanBoardProps) {
  const {
    sensors,
    activeTask,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    wasJustDragged,
  } = useDragAndDrop({ tasks, onMoveTask })

  const assigneeMap = useMemo(
    () => new Map(assignees.map((assignee) => [assignee.id, assignee])),
    [assignees],
  )

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        column,
        tasks: getColumnTasks(tasks, column.id),
      })),
    [tasks],
  )

  const titleById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task.title])),
    [tasks],
  )

  const describe = useCallback(
    (id: string | number) => {
      const key = String(id)
      if (isTaskStatus(key)) return `колонка «${getColumn(key).title}»`
      return `карточка «${titleById.get(key) ?? 'задача'}»`
    },
    [titleById],
  )

  const handleCardClick = useCallback(
    (task: Task) => {
      // Клик сразу после перетаскивания не должен открывать карточку.
      if (wasJustDragged()) return
      onTaskClick(task)
    },
    [onTaskClick, wasJustDragged],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Взята ${describe(active.id)}.`,
          onDragOver: ({ active, over }) =>
            over ? `${describe(active.id)} над ${describe(over.id)}.` : undefined,
          onDragEnd: ({ active, over }) =>
            over
              ? `${describe(active.id)} перемещена в ${describe(over.id)}.`
              : `${describe(active.id)} возвращена на место.`,
          onDragCancel: ({ active }) => `Перетаскивание ${describe(active.id)} отменено.`,
        },
        screenReaderInstructions: {
          draggable:
            'Нажмите пробел, чтобы взять карточку. Стрелки перемещают карточку, пробел опускает, Escape отменяет перетаскивание.',
        },
      }}
    >
      <div className="scrollbar-subtle flex h-full min-h-0 gap-3 overflow-x-auto p-4">
        {columns.map(({ column, tasks: columnTasks }) => {
          const isDropTarget = dropTarget?.status === column.id
          // Внутри своей колонки место вставки показывает сам sortable,
          // поэтому заглушка рисуется только при переносе в другую колонку.
          const showPlaceholder = isDropTarget && activeTask?.status !== column.id

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              assigneeMap={assigneeMap}
              isDropTarget={isDropTarget}
              dropIndex={showPlaceholder ? dropTarget?.index ?? null : null}
              onTaskClick={handleCardClick}
            />
          )
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
        {activeTask ? (
          <DragOverlayCard
            task={activeTask}
            assignee={
              activeTask.assigneeId ? assigneeMap.get(activeTask.assigneeId) : undefined
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
