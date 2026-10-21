import { CalendarDays } from 'lucide-react'

import { cn } from '../../lib/cn'
import { formatDueDate, isOverdue } from '../../lib/taskUtils'
import type { Assignee, Task } from '../../types/task'
import { Avatar } from '../ui/Avatar'
import { PriorityBadge } from '../ui/Badge'
import { Tag } from '../ui/Tag'

interface TaskCardContentProps {
  task: Task
  assignee: Assignee | undefined
}

/** Содержимое карточки задачи. Общее для карточки в колонке и для DragOverlay. */
export function TaskCardContent({ task, assignee }: TaskCardContentProps) {
  const overdue = isOverdue(task)

  return (
    <div className="flex flex-col gap-2">
      <p className="line-clamp-2 break-words text-[13px] font-medium leading-[1.35] text-ink">
        {task.title}
      </p>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] tabular-nums',
                overdue ? 'font-medium text-rose-600' : 'text-ink-subtle',
              )}
              title={overdue ? 'Срок выполнения просрочен' : 'Срок выполнения'}
            >
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

        {assignee && <Avatar name={assignee.name} color={assignee.color} />}
      </div>
    </div>
  )
}
