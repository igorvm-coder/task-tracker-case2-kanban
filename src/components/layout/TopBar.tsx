import { LayoutDashboard, Plus } from 'lucide-react'

import { TaskFilters } from '../filters/TaskFilters'
import { SettingsMenu } from '../settings/SettingsMenu'
import { ThemeToggle } from '../settings/ThemeToggle'
import type { TaskFilters as Filters } from '../../lib/filters'
import type { Theme } from '../../types/board'
import type { Assignee } from '../../types/task'
import { Button } from '../ui/Button'

interface TopBarProps {
  /** Всего задач на доске. */
  taskCount: number
  /** Задач, которые видно с учётом фильтров. */
  visibleCount: number
  assignees: Assignee[]
  filters: Filters
  theme: Theme
  onThemeToggle: () => void
  onExport: () => void
  onImport: (file: File) => void
  onFiltersChange: (filters: Filters) => void
  onCreateTask: () => void
}

/** Склонение существительного «задача». */
function pluralize(count: number): string {
  const mod100 = count % 100
  const mod10 = count % 10
  if (mod100 >= 11 && mod100 <= 14) return 'задач'
  if (mod10 === 1) return 'задача'
  if (mod10 >= 2 && mod10 <= 4) return 'задачи'
  return 'задач'
}

/** Верхняя панель: название доски, поиск с фильтрами и кнопка создания задачи. */
export function TopBar({
  taskCount,
  visibleCount,
  assignees,
  filters,
  theme,
  onThemeToggle,
  onExport,
  onImport,
  onFiltersChange,
  onCreateTask,
}: TopBarProps) {
  const filtered = visibleCount !== taskCount

  return (
    <header className="flex flex-col gap-3 border-b border-line bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-white shadow-xs">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[14px] font-semibold leading-tight text-ink">
              Roadmap продукта
            </h1>
            <p className="truncate text-[12px] leading-tight text-ink-subtle">
              {filtered
                ? `${visibleCount} из ${taskCount} ${pluralize(taskCount)} на доске`
                : `${taskCount} ${pluralize(taskCount)} на доске`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} className="hidden sm:grid" />
          <SettingsMenu
            theme={theme}
            onThemeToggle={onThemeToggle}
            onExport={onExport}
            onImport={onImport}
          />
          <Button
            variant="primary"
            icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={onCreateTask}
          >
            <span className="hidden sm:inline">Создать задачу</span>
            <span className="sm:hidden">Создать</span>
          </Button>
        </div>
      </div>

      <TaskFilters assignees={assignees} filters={filters} onChange={onFiltersChange} />
    </header>
  )
}
