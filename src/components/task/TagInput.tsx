import { useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { normalizeTags } from '../../lib/taskValidation'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

/**
 * Поле тегов: значения добавляются через запятую или Enter,
 * удаляются кнопкой «×» на чипе или Backspace в пустом поле.
 */
export function TagInput({ tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addDraft = () => {
    const parts = normalizeTags(draft.split(/[,\n\t]+/))
    if (parts.length === 0) return
    onChange(normalizeTags([...tags, ...parts]))
    setDraft('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addDraft()
      return
    }

    if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!/[,;\n\t]/.test(text)) return
    event.preventDefault()
    onChange(normalizeTags([...tags, ...text.split(/[,;\n\t]+/)]))
  }

  return (
    <div className="rounded-lg bg-surface ring-1 ring-line transition-[box-shadow,ring-color] hover:ring-line-strong focus-within:ring-2 focus-within:ring-accent">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 border-b border-line px-2 pt-2 pb-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex max-w-full items-center gap-0.5 rounded-md bg-muted py-0.5 pr-0.5 pl-1.5 text-[11px] font-medium text-ink-muted"
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Удалить тег ${tag}`}
                className="rounded p-0.5 text-ink-subtle transition-colors hover:bg-line hover:text-ink"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="design, mobile…"
        aria-label="Добавить тег"
        className="h-8 w-full bg-transparent px-2 text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none"
      />
    </div>
  )
}
