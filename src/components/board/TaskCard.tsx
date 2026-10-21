import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '../../lib/cn'
import type { Assignee, Task } from '../../types/task'
import { TaskCardContent } from './TaskCardContent'

interface TaskCardProps {
  task: Task
  assignee: Assignee | undefined
  onClick?: (task: Task) => void
}

/** Карточка задачи в колонке: перетаскивается мышью, пальцем и с клавиатуры. */
export function TaskCard({ task, assignee, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onClick?.(task)
        }
      }}
      className={cn(
        'group cursor-grab touch-manipulation select-none rounded-[10px] bg-surface p-3 shadow-xs ring-1 ring-line transition-[box-shadow,opacity] duration-150',
        'hover:shadow-md hover:ring-line-strong active:cursor-grabbing',
        isDragging && 'opacity-40 shadow-none ring-transparent',
      )}
    >
      <TaskCardContent task={task} assignee={assignee} />
    </div>
  )
}
