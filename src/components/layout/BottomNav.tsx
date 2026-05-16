import { cn } from '@/utils'
import type { AppScreen } from '@/types'

interface NavItem {
  id:    AppScreen
  icon:  string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'backlog',     icon: '▦',  label: 'Backlog' },
  { id: 'backlog',     icon: '☰',  label: 'Hoje'    },
  { id: 'focus',       icon: '⚡', label: 'Foco'    },
  { id: 'day-summary', icon: '◉',  label: 'Resumo'  },
]

interface BottomNavProps {
  current: AppScreen
  onNavigate: (screen: AppScreen) => void
}

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-30
                 glass border-t border-surface-highest pb-safe"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map((item, i) => {
          const isActive = current === item.id

          return (
            <button
              key={i}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'nav-item',
                isActive && 'active',
              )}
            >
              <span className={cn(
                'text-xl transition-transform duration-200',
                isActive && 'scale-110',
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
