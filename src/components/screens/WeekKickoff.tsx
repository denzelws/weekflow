import { Button, Badge, ProgressBar } from '@/components/ui'
import { AppShell, Header } from '@/components/layout'
import { formatDate, getWeekDays } from '@/utils'
import type { AppStore } from '@/store/useAppStore'

interface WeekKickoffProps {
  store: AppStore
}

export function WeekKickoff({ store }: WeekKickoffProps) {
  const { state }     = store
  const { tasks, currentWeek, profile } = state

  if (!currentWeek) return null

  const start   = new Date(currentWeek.startDate + 'T00:00:00')
  const days    = getWeekDays(start)
  const today   = new Date().toISOString().split('T')[0]

  return (
    <AppShell
      header={<Header profile={profile} />}
      className="px-6"
    >
      {/* Hero section */}
      <div className="pt-8 pb-6 anim-hidden animate-slide-up delay-0" style={{ animationFillMode:'forwards' }}>
        <Badge variant="primary" className="mb-4">Quest Aceita ⚡</Badge>
        <h1 className="text-h1 mb-2">
          Sua semana<br />
          <span className="text-gradient">está pronta.</span>
        </h1>
        <p className="text-body text-muted">
          {tasks.length} tarefa{tasks.length > 1 ? 's' : ''} no backlog ·{' '}
          {formatDate(today)}
        </p>
      </div>

      {/* Weekly progress bar */}
      <div className="mb-6 anim-hidden animate-slide-up delay-100" style={{ animationFillMode:'forwards' }}>
        <ProgressBar
          value={0}
          label="Progresso da semana"
          className="mb-1"
        />
      </div>

      {/* Day strip — RN-06: current day highlighted */}
      <div className="flex gap-2 mb-8 anim-hidden animate-slide-up delay-150" style={{ animationFillMode:'forwards' }}>
        {days.map((day, i) => {
          const isToday = day === today
          const label   = new Date(day + 'T00:00:00')
            .toLocaleDateString('pt-BR', { weekday: 'short' })
            .replace('.','').toUpperCase().slice(0,3)

          return (
            <div
              key={day}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg
                ${isToday ? 'bg-primary-muted border border-primary/40' : 'bg-surface-high'}`}
            >
              <span className={`text-label ${isToday ? 'text-primary' : 'text-on-muted'}`}>
                {label}
              </span>
              {isToday && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          )
        })}
      </div>

      {/* Task reveal list — staggered (RN-05) */}
      <div className="flex-1 flex flex-col gap-2 mb-8">
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className="anim-hidden animate-slide-in-right card-low py-3"
            style={{
              animationDelay:    `${200 + i * 50}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-label text-primary w-4 text-right flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-body-sm font-medium text-on-surface">{task.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA — RN-07: mandatory confirmation */}
      <div
        className="pb-10 anim-hidden animate-slide-up"
        style={{ animationDelay: `${200 + tasks.length * 50 + 100}ms`, animationFillMode:'forwards' }}
      >
        <Button
          fullWidth
          size="lg"
          onClick={store.startWeek}
          iconRight={<span>🚀</span>}
        >
          Start the Week
        </Button>
        <p className="text-center text-label mt-3">
          Comprometimento é o primeiro passo.
        </p>
      </div>
    </AppShell>
  )
}
