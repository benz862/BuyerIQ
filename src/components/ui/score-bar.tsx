import { cn } from "@/lib/utils";

export function ScoreBar({
  value,
  className,
  label = "BuyerIQ score",
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const score = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
      className={cn("space-y-1.5", className)}
    >
      <div className="relative h-3 overflow-visible rounded-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-600 shadow-inner">
        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-md"
          style={{ left: `${score}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-muted-foreground" aria-hidden="true">
        <span>High risk</span>
        <span>Use caution</span>
        <span>Strong match</span>
      </div>
    </div>
  );
}
