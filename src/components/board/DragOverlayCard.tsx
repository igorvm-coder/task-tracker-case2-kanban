import type { Assignee, Task } from '../../types/task'
import { TaskCardContent } from './TaskCardContent'

interface DragOverlayCardProps {
  task: Task
  assignee: Assignee | undefined
}

/** Плавающая копия карточки, которая следует за указателем во время перетаскивания. */
export function DragOverlayCard({ task, assignee }: DragOverlayCardProps) {
  return (
    <div className="w-[300px] max-w-[85vw] rotate-[1.5deg] rounded-[10px] bg-surface p-3 shadow-xl ring-1 ring-accent/30">
      <TaskCardContent task={task} assignee={assignee} />
    </div>
  )
}
