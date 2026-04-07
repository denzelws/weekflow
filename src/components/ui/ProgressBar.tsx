import { cn } from '@/utils'

interface ProgressBarProps {
  value: number       // 0–1
  className?: string
  trackClassName?: string
  animated?: boolean
  label?: string
}

export function ProgressBar({
  value, className, trackClassName, animated = true, label,
}: ProgressBarProps) {
  const pct = Math.min(Math.max(value * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-label">{label}</span>
          <span className="text-label text-primary">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('progress-track', trackClassName)}>
        <div
          className={cn('progress-fill', animated && 'transition-all duration-700')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
