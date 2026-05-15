import { cn } from "@/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedClass = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-xl",
  full: "rounded-pill",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div className={cn("shimmer", roundedClass[rounded], "h-4", className)} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card-low flex flex-col gap-3">
      <Skeleton className="w-1/3 h-3" rounded="full" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? "w-2/3" : "w-full"}
          rounded="sm"
        />
      ))}
    </div>
  );
}
