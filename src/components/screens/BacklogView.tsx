import { useMemo } from 'react'
import { Button, TaskCard, WeekCalendar, ProgressBar } from '@/components/ui'
import { AppShell, Header, BottomNav } from '@/components/layout'
import { today, formatDate } from '@/utils'
import type { AppStore } from '@/store/useAppStore'

interface BacklogViewProps {
  store: AppStore
}

export function BacklogView({ store }: BacklogViewProps) {
  const { state }    = store
  const { tasks, currentWeek, todaySession, profile } = state

  const todayStr     = today()
  const sessionOpen  = !!todaySession && !todaySession.closedAt
  const alreadyFocusing = sessionOpen && todaySession!.selectedTasks.length === 3

  // RN-11: lock selection after focus started
  const selectionLocked = alreadyFocusing

  const selectedCount = todaySession?.selectedTasks.length ?? 0

  // Split tasks: pending/today vs completed
  const pendingTasks   = useMemo(() =>
    tasks.filter(t => t.status !== 'completed'), [tasks])
  const completedTasks = useMemo(() =>
    tasks.filter(t => t.status === 'completed'), [tasks])

  // Week progress
  const weekProgress = currentWeek
    ? currentWeek.completedTasks / Math.max(currentWeek.totalTasks, 1)
    : 0

  return (
    <AppShell
      header={<Header profile={profile} />}
      showNav
      className="px-6"
    >
      {/* Week calendar strip */}
      {currentWeek && (
        <div className="pt-6 mb-6 anim-hidden animate-fade-in" style={{ animationFillMode:'forwards' }}>
          <WeekCalendar week={currentWeek} tasks={tasks} />
          <ProgressBar value={weekProgress} className="mt-3" />
        </div>
      )}

      {/* Today header — RN-08 */}
      <div className="mb-4 anim-hidden animate-slide-up delay-100" style={{ animationFillMode:'forwards' }}>
        <h2 className="text-h3 mb-1">
          Hoje —{' '}
          <span className="text-gradient">{formatDate(todayStr)}</span>
        </h2>

        {!selectionLocked ? (
          <p className="text-body-sm text-muted">
            {selectedCount === 0
              ? 'Escolha 3 tarefas para hoje.'
              : selectedCount < 3
              ? `Mais ${3 - selectedCount} para selecionar.`
              : 'Pronto! Bora focar?'}
          </p>
        ) : (
          <p className="text-body-sm text-muted">
            Seleção bloqueada — sessão em andamento.
          </p>
        )}
      </div>

      {/* CTA: start focus — enabled when exactly 3 selected (RN-08) */}
      {selectedCount === 3 && !alreadyFocusing && (
        <div className="mb-5 animate-fade-in">
          <Button
            fullWidth
            onClick={store.startFocus}
            iconRight={<span>→</span>}
          >
            Let's Focus
          </Button>
        </div>
      )}

      {/* Resume focus if session already active */}
      {alreadyFocusing && (
        <div className="mb-5 animate-fade-in">
          <Button
            fullWidth
            onClick={store.startFocus}
            iconRight={<span>⚡</span>}
          >
            Continuar Foco
          </Button>
        </div>
      )}

      {/* Backlog — pending tasks */}
      <div className="mb-2">
        <p className="section-label">Backlog da semana</p>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {pendingTasks.length === 0 && (
          <p className="text-body-sm text-muted text-center py-8">
            Todas as tarefas foram concluídas 🎉
          </p>
        )}
        {pendingTasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            selectable={!selectionLocked}
            selectedCount={selectedCount}
            onToggle={store.toggleTodayTask}
            animDelay={i * 40}
          />
        ))}
      </div>

      {/* Completed tasks — RN-10: greyed out */}
      {completedTasks.length > 0 && (
        <>
          <div className="mb-2">
            <p className="section-label">Concluídas</p>
          </div>
          <div className="flex flex-col gap-2 mb-8">
            {completedTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                animDelay={i * 30}
              />
            ))}
          </div>
        </>
      )}

      {/* Bottom nav */}
      <BottomNav
        current={state.screen}
        onNavigate={() => {}}
      />
    </AppShell>
  )
}
