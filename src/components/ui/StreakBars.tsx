import { cn } from '@/utils'

interface StreakBarsProps {
  streak: number   // current streak count
  max?: number     // total bars to show (default 7)
  className?: string
}

export function StreakBars({ streak, max = 7, className }: StreakBarsProps) {
  return (
    <div className={cn('flex items-end gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const isActive = i === streak - 1
        const isDone   = i < streak - 1

        return (
          <div
            key={i}
            className={cn(
              'streak-bar',
              isActive ? 'active' : isDone ? 'done' : 'empty',
            )}
            style={{
              transitionDelay: `${i * 60}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
