import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  /** React 19: ref передаётся обычным пропом. */
  ref?: Ref<HTMLButtonElement>
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-xs hover:bg-accent-hover active:bg-accent-hover disabled:hover:bg-accent',
  secondary:
    'bg-surface text-ink ring-1 ring-line shadow-xs hover:bg-muted hover:ring-line-strong disabled:hover:bg-surface',
  ghost: 'text-ink-muted hover:bg-muted hover:text-ink disabled:hover:bg-transparent',
}

export function Button({
  variant = 'secondary',
  icon,
  className,
  children,
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
