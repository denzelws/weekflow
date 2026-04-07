import type { ReactNode } from 'react'
import { cn } from '@/utils'

type Variant = 'primary' | 'secondary' | 'gold' | 'muted'

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

const variantClass: Record<Variant, string> = {
  primary:   'badge-primary',
  secondary: 'badge-secondary',
  gold:      'badge-gold',
  muted:     'badge-muted',
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span className={cn(variantClass[variant], className)}>
      {children}
    </span>
  )
}
