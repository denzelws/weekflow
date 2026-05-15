import { type ReactNode } from "react";
import { cn } from "@/utils";
import type { AppScreen } from "@/types";

const SLIDE_DIRECTION: Record<AppScreen, string> = {
  "brain-dump": "animate-fade-in",
  "week-kickoff": "animate-slide-up",
  backlog: "animate-slide-up",
  focus: "animate-slide-in-right",
  "day-summary": "animate-slide-up",
};

interface ScreenTransitionProps {
  screen: AppScreen;
  children: ReactNode;
}

export function ScreenTransition({ screen, children }: ScreenTransitionProps) {
  return (
    <div
      key={screen}
      className={cn("w-full min-h-dvh", "anim-hidden", SLIDE_DIRECTION[screen])}
      style={{ animationFillMode: "forwards" }}
    >
      {children}
    </div>
  );
}
