import { useRef } from 'react'

import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface DeleteTaskDialogProps {
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/** Отдельный диалог подтверждения удаления задачи. */
export function DeleteTaskDialog({ taskTitle, onConfirm, onCancel }: DeleteTaskDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  return (
    <Modal
      label="Удалить задачу?"
      onClose={onCancel}
      initialFocusRef={cancelRef}
      className="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold text-ink">Удалить задачу?</h2>
          <p className="text-[13px] leading-snug text-ink-muted">
            Задача «<span className="text-ink">{taskTitle}</span>» будет удалена без возможности
            восстановления.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button ref={cancelRef} onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={onConfirm}>
            Да, удалить
          </Button>
        </div>
      </div>
    </Modal>
  )
}
