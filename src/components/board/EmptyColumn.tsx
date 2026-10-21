import { Inbox } from 'lucide-react'

/** Пустое состояние колонки. */
export function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line px-3 py-6 text-center">
      <Inbox className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
      <p className="text-[12px] text-ink-subtle">Здесь пока пусто</p>
    </div>
  )
}
