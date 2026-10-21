import { useCallback, useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  children: ReactNode
  /** Описание окна для скринридера. */
  label: string
  /** Закрытие по Esc и клику вне панели. */
  dismissible?: boolean
  onClose: () => void
  /** Элемент, который получает фокус при открытии. */
  initialFocusRef?: RefObject<HTMLElement | null>
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Базовое модальное окно: портал, затемнённый фон, Esc и клик вне окна,
 * блокировка прокрутки страницы, удержание фокуса внутри и возврат фокуса
 * на открывший элемент при закрытии.
 */
export function Modal({
  children,
  label,
  dismissible = true,
  onClose,
  initialFocusRef,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation()
        onClose()
        return
      }

      // Удерживаем фокус внутри панели при переходе по Tab.
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [dismissible, onClose],
  )

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const target =
      initialFocusRef?.current ??
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      panelRef.current
    target?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [initialFocusRef])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`relative my-auto w-full max-w-lg rounded-xl bg-surface p-5 shadow-2xl ring-1 ring-line ${className ?? ''}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
