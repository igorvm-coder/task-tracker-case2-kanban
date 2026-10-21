import { PRIORITIES } from '../../constants/priorities'
import { cn } from '../../lib/cn'
import type { TaskPriority } from '../../types/task'

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

/**
 * Приоритет задачи. Цвет дополнен иконкой и текстовой подписью,
 * поэтому значение не определяется только цветом.
 */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const meta = PRIORITIES[priority]
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium ring-1 ring-inset',
        meta.badge,
        className,
      )}
      title={`Приоритет: ${meta.label.toLowerCase()}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  )
}
