import { useState } from 'react'
import { Button, Badge, StreakBars, ProgressBar } from '@/components/ui'
import { AppShell, Header } from '@/components/layout'
import { calcLevelProgress } from '@/utils'
import type { AppStore } from '@/store/useAppStore'

interface DaySummaryProps {
  store: AppStore
}

export function DaySummary({ store }: DaySummaryProps) {
  const { state } = store
  const { profile, todaySession, tasks } = state

  const [closing, setClosing] = useState(false)

  if (!todaySession) return null

  const { completedCount, xpEarned, isPerfectDay } = todaySession
  const levelProgress = calcLevelProgress(profile.totalXP)

  // Tasks available to carry over (today, not completed)
  const carryOverCandidates = tasks.filter(
    t => t.dayAssigned && t.status !== 'completed'
  )

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      store.closeDay()
      setClosing(false)
    }, 400)
  }

  return (
    <AppShell
      header={<Header profile={profile} />}
      className="px-6"
    >
      <div
        className={`flex flex-col flex-1 pt-8 transition-opacity duration-400 ${
          closing ? 'opacity-0' : 'opacity-100'
        }`}
      >

        {/* Hero greeting */}
        <div className="mb-8 anim-hidden animate-slide-up" style={{ animationFillMode:'forwards' }}>
          {isPerfectDay
            ? <Badge variant="primary" className="mb-4">Perfect Day 🔥</Badge>
            : <Badge variant="muted" className="mb-4">Bom trabalho</Badge>
          }
          <h1 className="text-h1 mb-2">
            {isPerfectDay
              ? <>Great focus,<br /><span className="text-gradient">{profile.name}!</span></>
              : <>Bom dia,<br /><span className="text-gradient">{profile.name}!</span></>
            }
          </h1>
          {isPerfectDay
            ? <p className="text-body text-muted">Você atingiu o estado de flow hoje.</p>
            : <p className="text-body text-muted">{completedCount} de 3 tarefas concluídas.</p>
          }
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 anim-hidden animate-slide-up delay-100"
             style={{ animationFillMode:'forwards' }}>

          {/* Weekly streak — RN-18 */}
          <div className="card-low flex flex-col gap-3">
            <span className="text-label">Weekly Streak</span>
            <p className="font-display text-3xl font-bold text-on-surface">
              {profile.currentStreak}
              <span className="text-on-muted text-xl font-normal">/7 Dias</span>
            </p>
            <StreakBars streak={profile.currentStreak} />
          </div>

          {/* XP earned */}
          <div className="card-low flex flex-col gap-3">
            <span className="text-label">XP Earned</span>
            <p className="font-display text-3xl font-bold text-primary">
              +{xpEarned}
            </p>
            <span className="text-label text-on-muted">hoje</span>
          </div>

          {/* Tasks done */}
          <div className="card-low flex flex-col gap-2">
            <span className="text-label">Tasks Done</span>
            <div className="flex items-end gap-1">
              <span className="font-display text-3xl font-bold text-on-surface">
                {completedCount}
              </span>
              <span className="text-on-muted text-sm mb-1">/ 3</span>
            </div>
            <ProgressBar value={completedCount / 3} />
          </div>

          {/* Level up — RN-16 */}
          <div className="card-low flex flex-col gap-2">
            <span className="text-label">Level Up</span>
            <p className="font-display text-3xl font-bold text-gradient">
              LVL {profile.level}
            </p>
            <ProgressBar value={levelProgress} />
          </div>
        </div>

        {/* Carry over section — RN-17 */}
        {carryOverCandidates.length > 0 && (
          <div className="mb-6 anim-hidden animate-slide-up delay-200"
               style={{ animationFillMode:'forwards' }}>
            <p className="section-label">Tarefas não concluídas</p>
            <div className="flex flex-col gap-2">
              {carryOverCandidates.slice(0, 1).map(task => (
                <div key={task.id} className="card-low flex items-center justify-between gap-3">
                  <p className="text-body-sm text-on-muted flex-1 truncate">{task.title}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => store.carryOver(task.id)}
                  >
                    Carry over →
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-label mt-2">
              Máximo 1 carry over por dia (RN-17)
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto pb-10
                        anim-hidden animate-slide-up delay-300"
             style={{ animationFillMode:'forwards' }}>

          <Button
            fullWidth
            size="lg"
            loading={closing}
            onClick={handleClose}
          >
            Close for Today
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={store.resetForNewWeek}
          >
            Nova Semana
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
