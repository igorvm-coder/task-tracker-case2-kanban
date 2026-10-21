import type { SelectHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  /** Пустая строка в начале списка (например, «Все исполнители»). */
  placeholder?: string
}

/** Стилизованный выпадающий список в духе Linear. */
export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-9 w-full cursor-pointer appearance-none rounded-lg bg-surface px-2.5 pr-7 text-[13px] text-ink ring-1 ring-line transition-[box-shadow,ring-color] hover:ring-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b919c' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
