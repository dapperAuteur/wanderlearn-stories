import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  /** "card" wraps in a Card; "inline" emits just the skeleton lines. */
  variant?: "card" | "inline";
  linesCount?: number;
  className?: string;
}

/**
 * The async loading treatment used across the app. Pair with a real
 * minimum-display-time (≥ 200 ms) to avoid flicker on fast loads.
 */
export default function LoadingState({
  label = "Loading…",
  variant = "card",
  linesCount = 3,
  className,
}: LoadingStateProps) {
  const lines = Array.from({ length: linesCount }, (_, i) => (
    <Skeleton
      key={i}
      className={cn(
        "h-3 w-full",
        i === 0 && "h-4 w-3/4",
        i === linesCount - 1 && "w-1/2",
      )}
    />
  ));

  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn("space-y-2", className)}
      >
        {lines}
      </div>
    );
  }

  return (
    <Card className={className} role="status" aria-live="polite">
      <CardHeader>
        <CardTitle className="sr-only">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{lines}</CardContent>
    </Card>
  );
}
