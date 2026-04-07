import type { ReactNode } from 'react'
import { cn } from '@/utils'

interface AppShellProps {
  children: ReactNode
  showNav?: boolean
  header?: ReactNode
  className?: string
}

export function AppShell({ children, showNav = false, header, className }: AppShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface max-w-sm mx-auto relative overflow-hidden">
      {/* Header slot */}
      {header && (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-30
                           bg-surface/80 backdrop-blur-glass px-6 py-4 flex items-center justify-between">
          {header}
        </header>
      )}

      {/* Main content */}
      <main
        className={cn(
          'flex-1 flex flex-col overflow-y-auto no-scrollbar',
          header  && 'pt-16',
          showNav && 'pb-20',
          className,
        )}
      >
        {children}
      </main>

      {/* Bottom nav slot (injected by screens that need it) */}
      {showNav && <BottomNavSlot />}
    </div>
  )
}

/** Reserved space for fixed bottom nav */
function BottomNavSlot() {
  return <div className="h-20 pb-safe" aria-hidden />
}
