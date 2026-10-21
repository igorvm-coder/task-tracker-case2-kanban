import type { CSSProperties, KeyboardEvent } from 'react'
import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '../../lib/cn'
import type { Assignee, Task } from '../../types/task'
import { TaskCardContent } from './TaskCardContent'

interface TaskCardProps {
  task: Task
  assignee: Assignee | undefined
  /** Отключает перетаскивание (например, при активных фильтрах). */
  disabled?: boolean
  onClick?: (task: Task) => void
}

/** Карточка задачи в колонке: перетаскивается мышью, пальцем и с клавиатуры. */
export const TaskCard = memo(function TaskCard({
  task,
  assignee,
  disabled = false,
  onClick,
}: TaskCardProps) {
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
    disabled,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Сначала даём dnd-kit обработать клавиши (Space — начало перетаскивания).
    const startDrag = listeners?.onKeyDown as
      | ((event: KeyboardEvent<HTMLDivElement>) => void)
      | undefined
    startDrag?.(event)
    if (event.defaultPrevented) return

    // Enter открывает карточку, как и обычный клик.
    if (event.key === 'Enter') {
      event.preventDefault()
      onClick?.(task)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      onKeyDown={handleKeyDown}
      title={disabled ? 'Перетаскивание отключено при активных фильтрах' : undefined}
      className={cn(
        'group touch-manipulation select-none rounded-[10px] bg-surface p-3 shadow-xs ring-1 ring-line transition-[box-shadow,opacity] duration-150',
        disabled
          ? 'cursor-default'
          : 'cursor-grab hover:shadow-md hover:ring-line-strong active:cursor-grabbing',
        isDragging && 'opacity-40 shadow-none ring-transparent',
      )}
    >
      <TaskCardContent task={task} assignee={assignee} />
    </div>
  )
})
