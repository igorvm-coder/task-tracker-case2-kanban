import { Moon, Sun } from 'lucide-react'

import { cn } from '../../lib/cn'
import type { Theme } from '../../types/board'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  className?: string
}

/**
 * Быстрый переключатель темы в верхней панели.
 * Иконка показывает цель переключения: луна — перейти в тёмную тему, солнце — в светлую.
 */
export function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  const nextIsDark = theme === 'light'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={nextIsDark ? 'Включить тёмную тему' : 'Включить светлую тему'}
      title={nextIsDark ? 'Тёмная тема' : 'Светлая тема'}
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink',
        className,
      )}
    >
      {nextIsDark ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
