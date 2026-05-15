import { cn } from "@/utils";
import { Checkbox } from "./Checkbox";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  selectable?: boolean;
  selectedCount?: number;
  onToggle?: (id: string) => void;
  className?: string;
  animDelay?: number;
}

export function TaskCard({
  task,
  selectable = false,
  selectedCount = 0,
  onToggle,
  className,
  animDelay = 0,
}: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isToday = task.status === "today";
  const isSelected = isToday;
  const isDisabled =
    isCompleted || (!isSelected && selectable && selectedCount >= 3);

  return (
    <div
      className={cn(
        "task-card anim-hidden animate-slide-up",
        isSelected && "selected",
        isCompleted && "completed",
        isDisabled &&
          !isSelected &&
          "opacity-40 cursor-not-allowed hover:bg-surface-low",
        className,
      )}
      style={{
        animationDelay: `${animDelay}ms`,
        animationFillMode: "forwards",
      }}
      onClick={() => !isDisabled && selectable && onToggle?.(task.id)}
    >
      {selectable && (
        <Checkbox
          checked={isCompleted}
          selected={isSelected}
          disabled={isDisabled && !isSelected}
          onChange={() => !isDisabled && onToggle?.(task.id)}
        />
      )}

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-body text-sm font-medium text-on-surface leading-snug",
            isCompleted && "line-through text-on-muted",
          )}
        >
          {task.title}
        </p>
        {isCompleted && (
          <span className="text-label text-success mt-0.5 block">
            Concluída
          </span>
        )}
        {task.status === "carried_over" && (
          <span className="text-label text-gold mt-0.5 block">Carregada</span>
        )}
      </div>

      {isSelected && !isCompleted && (
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
      )}
    </div>
  );
}
