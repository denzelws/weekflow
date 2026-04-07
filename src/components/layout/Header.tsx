import { cn } from '@/utils'
import { Badge } from '@/components/ui'
import type { UserProfile } from '@/types'

interface HeaderProps {
  profile: UserProfile
  className?: string
}

export function Header({ profile, className }: HeaderProps) {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-sm bg-primary-gradient rotate-45" />
        <span className="font-display text-sm font-bold tracking-tight text-on-surface">
          WEEKFLOW
        </span>
      </div>

      {/* Profile info */}
      <div className="flex items-center gap-2">
        <Badge variant="muted">
          ⚡ {profile.totalXP} XP
        </Badge>
        <div className="w-8 h-8 rounded-full bg-primary-muted border border-primary/30
                        flex items-center justify-center
                        font-display text-xs font-bold text-primary">
          {profile.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  )
}
