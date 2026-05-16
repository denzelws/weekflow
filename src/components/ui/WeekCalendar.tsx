import { cn, getWeekDays, shortDayLabel, today } from "@/utils";
import type { Week, Task } from "@/types";

interface WeekCalendarProps {
  week: Week;
  tasks: Task[];
  className?: string;
}

export function WeekCalendar({ week, tasks, className }: WeekCalendarProps) {
  const start = new Date(week.startDate + "T00:00:00");
  const days = getWeekDays(start);
  const todayStr = today();

  return (
    <div className={cn("flex gap-1.5 justify-between", className)}>
      {days.map((day) => {
        const isToday = day === todayStr;
        const dayTasks = tasks.filter((t) => t.dayAssigned === day);
        const completed = dayTasks.filter(
          (t) => t.status === "completed",
        ).length;
        const total = dayTasks.length;

        return (
          <div
            key={day}
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 py-2 px-1 rounded-lg transition-colors",
              isToday && "bg-primary-muted",
              !isToday && "bg-surface-high",
            )}
          >
            <span className={cn("text-label", isToday && "text-primary")}>
              {shortDayLabel(day)}
            </span>

            {/* Dot indicators */}
            <div className="flex flex-col gap-0.5">
              {total > 0 ? (
                Array.from({ length: Math.min(total, 3) }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 h-1 rounded-full",
                      i < completed ? "bg-primary" : "bg-surface-highest",
                      isToday && i >= completed && "bg-primary/30",
                    )}
                  />
                ))
              ) : (
                <div className="w-1 h-1 rounded-full bg-surface-highest" />
              )}
            </div>

            {isToday && (
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}
