import { useEffect, useState } from "react";
import { cn } from "@/utils";

interface CompletionBloomProps {
  xp: number;
  onDone?: () => void;
}

export function CompletionBloom({ xp, onDone }: CompletionBloomProps) {
  const [phase, setPhase] = useState<"bloom" | "check" | "exit">("bloom");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("check"), 400);
    const t2 = setTimeout(() => setPhase("exit"), 900);
    const t3 = setTimeout(() => onDone?.(), 1100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-surface/90 backdrop-blur-glass",
        "transition-opacity duration-200",
        phase === "exit" ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "absolute rounded-full transition-all duration-500",
            phase === "bloom"
              ? "w-0 h-0 bg-secondary opacity-60"
              : "w-64 h-64 bg-secondary opacity-0 scale-150",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        />

        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full",
            "transition-all duration-500",
            phase === "bloom"
              ? "w-0 h-0 opacity-0"
              : "w-24 h-24 bg-primary opacity-100",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          {phase !== "bloom" && (
            <svg
              className="w-12 h-12 text-on-primary animate-spin-in"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 12 9 17 20 7" />
            </svg>
          )}
        </div>
      </div>

      {phase === "check" && (
        <div className="mt-6 animate-fade-in">
          <p className="font-display text-4xl font-bold text-primary">
            +{xp} XP
          </p>
          <p className="text-label text-center mt-1">TASK COMPLETED</p>
        </div>
      )}
    </div>
  );
}
