import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui'
import type { AppStore } from '@/store/useAppStore'

const MAX_TASKS = 21
const PLACEHOLDER = `Ex: Finalizar relatório, Ligar para o dentista
Estudar para a prova
Compras do mercado; Reunião com o time...`

interface BrainDumpProps {
  store: AppStore
}

export function BrainDump({ store }: BrainDumpProps) {
  const [text, setText] = useState('')
  const ref  = useRef<HTMLTextAreaElement>(null)

  // Estimate task count from current text
  const taskCount = text
    .split(/[,\n;]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 3).length

  const overLimit = taskCount > MAX_TASKS
  const canSubmit = taskCount > 0 && !overLimit

  useEffect(() => { ref.current?.focus() }, [])

  return (
    <div className="screen px-8 justify-between">

      {/* Top — branding mark */}
      <div className="flex items-center gap-2 pt-2 animate-fade-in">
        <span className="w-2 h-2 rounded-sm bg-primary rotate-45 inline-block" />
        <span className="font-display text-xs font-bold tracking-widest text-on-muted uppercase">
          WeekFlow
        </span>
      </div>

      {/* Middle — headline + textarea */}
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="anim-hidden animate-slide-up delay-100" style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-h1 mb-3 leading-tight">
            What's your<br />
            <span className="text-gradient">week about?</span>
          </h1>
          <p className="text-body text-muted">
            Jogue tudo aqui. Sem filtro necessário.
          </p>
        </div>

        <div
          className="anim-hidden animate-slide-up delay-200"
          style={{ animationFillMode: 'forwards' }}
        >
          <textarea
            ref={ref}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={6}
            className="textarea w-full"
            aria-label="Lista de tarefas da semana"
          />

          {/* Task counter */}
          <div className="flex justify-between mt-2 px-1">
            <span className="text-label">
              {taskCount > 0 ? `${taskCount} tarefa${taskCount > 1 ? 's' : ''}` : ''}
            </span>
            <span className={`text-label ${overLimit ? 'text-secondary' : 'text-on-muted'}`}>
              {taskCount}/{MAX_TASKS} máx
            </span>
          </div>

          {/* Over-limit warning (RN-03) */}
          {overLimit && (
            <p className="text-body-sm text-secondary mt-2 animate-fade-in">
              Máximo {MAX_TASKS} tarefas por semana (3/dia × 7 dias).
              Remova {taskCount - MAX_TASKS} para continuar.
            </p>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="anim-hidden animate-slide-up delay-300 pb-safe"
        style={{ animationFillMode: 'forwards' }}
      >
        <Button
          fullWidth
          size="lg"
          disabled={!canSubmit}
          onClick={() => store.buildWeek(text)}
          iconRight={<span className="text-lg">→</span>}
        >
          Build my week
        </Button>
      </div>
    </div>
  )
}
