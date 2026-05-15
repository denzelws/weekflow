import { useState, useEffect, useRef } from "react";
import { Button, XPPop, ProgressBar } from "@/components/ui";
import { AppShell, Header } from "@/components/layout";
import { cn, calcDayXP } from "@/utils";
import { useApp } from "@/store/AppContext";

export function FocusMode() {
  const store = useApp();
  const { state, activeTask, activeTasks } = store;
  const { profile, todaySession, activeFocusIdx } = state;

  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [showOthers, setShowOthers] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // 25 min Pomodoro
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSelected = todaySession?.selectedTasks.length ?? 3;
  const progress = activeFocusIdx / totalSelected;
  const remaining = activeTasks?.filter((_, i) => i > activeFocusIdx) ?? [];

  // RN-15: Pomodoro timer (optional)
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            return 25 * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [timerActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDone = () => {
    if (completing) return;
    setCompleting(true);

    // Calculate XP for this task
    const xp =
      calcDayXP(
        (todaySession?.completedCount ?? 0) + 1,
        profile.currentStreak,
      ) - calcDayXP(todaySession?.completedCount ?? 0, profile.currentStreak);

    setXpAmount(Math.max(xp, 10));
    setShowXP(true);
    setTimerActive(false);

    setTimeout(() => {
      store.completeTask();
      setCompleting(false);
      setShowXP(false);
      setSeconds(25 * 60);
      setShowOthers(false);
    }, 900);
  };

  if (!activeTask) return null;

  return (
    <AppShell header={<Header profile={profile} />} className="px-6">
      <div className="flex flex-col flex-1 pt-8">
        {/* Progress strip */}
        <div
          className="mb-8 anim-hidden animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="flex justify-between mb-2">
            <span className="text-label">
              Tarefa {activeFocusIdx + 1} de {totalSelected}
            </span>
            <span className="text-label text-primary">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Current task — focus card (RN-12: pulse animation) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
          {/* XP pop overlay */}
          {showXP && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <XPPop amount={xpAmount} />
            </div>
          )}

          {/* CURRENT FOCUS label */}
          <span className="text-label text-primary tracking-widest">
            CURRENT FOCUS
          </span>

          {/* Task title */}
          <div
            className={cn(
              "card w-full text-center py-10 task-card focus-active border border-primary/20",
              completing && "opacity-0 scale-95 transition-all duration-300",
            )}
          >
            <h2 className="text-h2 leading-snug">{activeTask.title}</h2>
          </div>

          {/* Timer — RN-15 */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setTimerActive((t) => !t)}
              className={cn(
                "font-display text-3xl font-bold transition-colors",
                timerActive ? "text-primary" : "text-on-muted",
              )}
            >
              {formatTime(seconds)}
            </button>
            <span className="text-label">
              {timerActive
                ? "Tocando — clique para pausar"
                : "Clique para iniciar timer"}
            </span>
          </div>

          {/* Done button */}
          <Button
            fullWidth
            size="lg"
            loading={completing}
            onClick={handleDone}
            iconRight={<span>✓</span>}
          >
            Done
          </Button>
        </div>

        {/* RN-12: hidden remaining tasks — collapsed pill */}
        {remaining.length > 0 && (
          <div className="mt-8 mb-4">
            <button
              onClick={() => setShowOthers((o) => !o)}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-pill",
                "bg-surface-high text-on-muted text-sm font-semibold",
                "transition-all duration-300 hover:bg-surface-highest",
              )}
            >
              {remaining.length} more today
              <span
                className={cn(
                  "transition-transform duration-200",
                  showOthers && "rotate-180",
                )}
              >
                ▾
              </span>
            </button>

            {/* Expanded other tasks — dimmed */}
            {showOthers && (
              <div className="mt-2 flex flex-col gap-2 animate-fade-in">
                {remaining.map(
                  (task) =>
                    task && (
                      <div
                        key={task.id}
                        className="card-low py-3 opacity-40 pointer-events-none"
                      >
                        <p className="text-body-sm text-on-muted">
                          {task.title}
                        </p>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
