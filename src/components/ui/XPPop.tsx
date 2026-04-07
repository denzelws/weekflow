import { useEffect, useState } from 'react'
import { cn } from '@/utils'

interface XPPopProps {
  amount: number
  onDone?: () => void
  className?: string
}

export function XPPop({ amount, onDone, className }: XPPopProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return (
    <span className={cn('xp-pop text-lg', className)}>
      +{amount} XP
    </span>
  )
}
