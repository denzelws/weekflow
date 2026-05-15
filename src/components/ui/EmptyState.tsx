import { cn } from "@/utils";
import { Button } from "./Button";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "📭",
  title,
  body,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6 gap-4",
        className,
      )}
    >
      <span className="text-5xl">{icon}</span>
      <div>
        <h3 className="text-h4 mb-1">{title}</h3>
        {body && <p className="text-body text-muted">{body}</p>}
      </div>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
