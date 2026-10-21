import { ConfirmDialog } from '../ui/ConfirmDialog'

interface DeleteTaskDialogProps {
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/** Диалог подтверждения удаления задачи. */
export function DeleteTaskDialog({ taskTitle, onConfirm, onCancel }: DeleteTaskDialogProps) {
  return (
    <ConfirmDialog
      title="Удалить задачу?"
      confirmLabel="Да, удалить"
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      Задача «<span className="text-ink">{taskTitle}</span>» будет удалена без возможности
      восстановления.
    </ConfirmDialog>
  )
}
