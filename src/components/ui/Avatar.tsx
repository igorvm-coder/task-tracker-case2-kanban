import { cn } from '../../lib/cn'
import { getInitials } from '../../lib/taskUtils'

type AvatarSize = 'sm' | 'md'

interface AvatarProps {
  name: string
  color: string
  size?: AvatarSize
}

const SIZES: Record<AvatarSize, string> = {
  sm: 'h-5 w-5 text-[9px]',
  md: 'h-6 w-6 text-[10px]',
}

/** Аватар исполнителя: кружок с инициалами и стабильным цветом. */
export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  return (
    <span
      title={name}
      aria-label={name}
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold tracking-wide text-white ring-2 ring-surface',
        SIZES[size],
      )}
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </span>
  )
}
