import { Search, X } from 'lucide-react'

import { PRIORITIES, PRIORITY_VALUES } from '../../constants/priorities'
import { EMPTY_FILTERS, hasActiveFilters } from '../../lib/filters'
import type { TaskFilters as Filters } from '../../lib/filters'
import type { Assignee } from '../../types/task'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'

interface TaskFiltersProps {
  assignees: Assignee[]
  filters: Filters
  onChange: (filters: Filters) => void
}

/** Панель поиска и фильтров над доской. */
export function TaskFilters({ assignees, filters, onChange }: TaskFiltersProps) {
  const active = hasActiveFilters(filters)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1 sm:max-w-[280px]">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Поиск по названию и описанию"
          aria-label="Поиск задач"
          className="h-8 w-full rounded-lg bg-surface pr-2 pl-8 text-[13px] text-ink ring-1 ring-line transition-[box-shadow,ring-color] placeholder:text-ink-subtle hover:ring-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

      <Select
        aria-label="Фильтр по исполнителю"
        value={filters.assigneeId ?? ''}
        onChange={(event) => onChange({ ...filters, assigneeId: event.target.value || null })}
        placeholder="Все исполнители"
        options={assignees.map((assignee) => ({ value: assignee.id, label: assignee.name }))}
        className="h-8 w-auto min-w-[150px]"
      />

      <Select
        aria-label="Фильтр по приоритету"
        value={filters.priority ?? ''}
        onChange={(event) =>
          onChange({
            ...filters,
            priority: (event.target.value || null) as Filters['priority'],
          })
        }
        placeholder="Любой приоритет"
        options={PRIORITY_VALUES.map((value) => ({ value, label: PRIORITIES[value].label }))}
        className="h-8 w-auto min-w-[140px]"
      />

      <Toggle
        checked={filters.hideDone}
        onChange={(hideDone) => onChange({ ...filters, hideDone })}
        label="Скрывать выполненные"
      />

      {active && (
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] whitespace-nowrap text-ink-subtle lg:inline">
            Перетаскивание отключено
          </span>
          <Button
            variant="ghost"
            className="h-8"
            icon={<X className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => onChange({ ...EMPTY_FILTERS })}
          >
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  )
}
