import { useRef } from 'react'
import type { ReactNode } from 'react'

import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** Красная кнопка подтверждения (для необратимых действий). */
  tone?: 'primary' | 'danger'
  /** Скрыть кнопку «Отмена» (для простых сообщений об ошибке). */
  hideCancel?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Диалог подтверждения действия. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel = 'Отмена',
  tone = 'primary',
  hideCancel = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  return (
    <Modal label={title} onClose={onCancel} initialFocusRef={cancelRef} className="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <div className="text-[13px] leading-snug text-ink-muted">{children}</div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {!hideCancel && (
            <Button ref={cancelRef} onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button
            variant="primary"
            className={tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
