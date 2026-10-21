import { cn } from '../../lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}

/** Компактный тумблер (переключатель) в стиле Linear. */
export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-muted hover:text-ink',
        className,
      )}
    >
      <span
        className={cn(
          'relative h-4 w-7 shrink-0 rounded-full transition-colors duration-150',
          checked ? 'bg-accent' : 'bg-line-strong',
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-xs transition-transform duration-150',
            checked ? 'translate-x-3.5' : 'translate-x-0.5',
          )}
        />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
