import { cn } from "@/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 80,
  stroke = 6,
  label,
  sublabel,
  className,
}: CircularProgressProps) {
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(Math.max(value, 0), 1);
  const gap = circumference - dash;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--surface-highest)"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#mintGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          style={{
            transition: "stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <defs>
          <linearGradient id="mintGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3afea0" />
            <stop offset="100%" stopColor="#11ec90" />
          </linearGradient>
        </defs>
      </svg>

      {(label || sublabel) && (
        <div className="absolute flex flex-col items-center leading-none">
          {label && (
            <span className="font-display font-bold text-sm text-on-surface">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-2xs text-on-muted mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
