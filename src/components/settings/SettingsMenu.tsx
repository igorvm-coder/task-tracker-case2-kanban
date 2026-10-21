import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Download, MoreHorizontal, Upload } from 'lucide-react'

import { cn } from '../../lib/cn'
import type { Theme } from '../../types/board'
import { ThemeToggle } from './ThemeToggle'

interface SettingsMenuProps {
  theme: Theme
  onThemeToggle: () => void
  onExport: () => void
  /** Вызывается с выбранным файлом импорта. */
  onImport: (file: File) => void
}

/** Выпадающее меню настроек: тема, экспорт и импорт JSON. */
export function SettingsMenu({ theme, onThemeToggle, onExport, onImport }: SettingsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Сбрасываем значение, чтобы тот же файл можно было выбрать повторно.
    event.target.value = ''
    if (file) onImport(file)
  }

  const menuItemClass =
    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink transition-colors hover:bg-muted'

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Настройки"
        onClick={() => setOpen((value) => !value)}
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-60 rounded-xl bg-surface p-1.5 shadow-lg ring-1 ring-line"
        >
          <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
            <span className="text-[12px] font-medium text-ink-muted">
              {theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
            </span>
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          </div>

          <div className="my-1 border-t border-line" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onExport()
            }}
            className={menuItemClass}
          >
            <Download className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
            Экспорт в JSON
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              fileInputRef.current?.click()
            }}
            className={cn(menuItemClass)}
          >
            <Upload className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
            Импорт из JSON
          </button>

        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
    </div>
  )
}
