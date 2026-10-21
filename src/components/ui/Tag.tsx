import { cn } from '../../lib/cn'

interface TagProps {
  label: string
  className?: string
}

/** Тег задачи. */
export function Tag({ label, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-muted',
        className,
      )}
    >
      {label}
    </span>
  )
}
