import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
} from 'react'

import { cn } from '../../lib/cn'

const CONTROL_CLASS =
  'w-full rounded-lg bg-surface px-2.5 text-[13px] text-ink ring-1 ring-line transition-[box-shadow,ring-color] placeholder:text-ink-subtle hover:ring-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

interface FieldProps {
  label: string
  /** Текст ошибки под контролом. */
  error?: string
  hint?: string
  children: (id: string) => ReactNode
  className?: string
}

/** Подпись поля формы с обязательным/опциональным маркером и текстом ошибки. */
export function Field({ label, error, hint, children, className }: FieldProps) {
  const id = useId()

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[12px] font-medium text-ink-muted">
        {label}
        {hint && !error && <span className="ml-1 font-normal text-ink-subtle">{hint}</span>}
      </label>
      {children(id)}
      {error && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** React 19: ref передаётся обычным пропом. */
  ref?: Ref<HTMLInputElement>
}

export function Input({ className, ref, ...props }: InputProps) {
  return <input ref={ref} className={cn(CONTROL_CLASS, 'h-9', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(CONTROL_CLASS, 'min-h-[84px] resize-y py-2 leading-[1.45]', className)}
      {...props}
    />
  )
}
