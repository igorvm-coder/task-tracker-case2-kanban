import { Fragment } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '../../lib/cn'
import type { Column } from '../../constants/columns'
import type { Assignee, Task } from '../../types/task'
import { EmptyColumn } from './EmptyColumn'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  assigneeMap: Map<string, Assignee>
  /** Колонка подсвечена как цель перетаскивания. */
  isDropTarget: boolean
  /** Индекс, куда встанет карточка (для заглушки места вставки). */
  dropIndex: number | null
  onTaskClick: (task: Task) => void
}

/** Место, куда будет вставлена перетаскиваемая карточка. */
function DropPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="h-[74px] rounded-[10px] border-2 border-dashed border-accent/40 bg-accent/5"
    />
  )
}

/** Колонка доски: заголовок, счётчик, список карточек и область приёма перетаскивания. */
export function KanbanColumn({
  column,
  tasks,
  assigneeMap,
  isDropTarget,
  dropIndex,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'column', status: column.id },
  })

  const taskIds = tasks.map((task) => task.id)

  return (
    <section
      className={cn(
        'flex h-full w-[300px] shrink-0 flex-col rounded-xl bg-muted/70 ring-1 transition-colors duration-150',
        isDropTarget ? 'bg-accent-soft/70 ring-accent/40' : 'ring-line',
      )}
      aria-label={`Колонка «${column.title}»`}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', column.accent)} />
          <h2 className="truncate text-[13px] font-semibold text-ink">{column.title}</h2>
          <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-ink-subtle ring-1 ring-line">
            {tasks.length}
          </span>
        </div>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="scrollbar-subtle min-h-[140px] flex-1 overflow-y-auto overscroll-contain px-2 pb-3"
        >
          <div className="flex flex-col gap-2">
            {tasks.map((task, index) => (
              <Fragment key={task.id}>
                {dropIndex === index && <DropPlaceholder />}
                <TaskCard
                  task={task}
                  assignee={task.assigneeId ? assigneeMap.get(task.assigneeId) : undefined}
                  onClick={onTaskClick}
                />
              </Fragment>
            ))}

            {dropIndex !== null && dropIndex >= tasks.length && <DropPlaceholder />}

            {tasks.length === 0 && dropIndex === null && <EmptyColumn />}
          </div>
        </div>
      </SortableContext>
    </section>
  )
}
