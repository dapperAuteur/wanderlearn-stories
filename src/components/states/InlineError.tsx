"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InlineErrorProps {
  title?: string;
  description?: string;
  /** Provide to render a "Try again" button. */
  onRetry?: () => void;
  /** When true, also render a "Home" link as a fallback action. */
  showHome?: boolean;
  /** Surfaces a digest/correlation id for support escalation. */
  digest?: string;
  className?: string;
}

const primaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const secondaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg border border-border hover:bg-secondary text-foreground font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * In-content error. Distinct from `app/error.tsx` (route boundary) and
 * `app/global-error.tsx` (root boundary) — use this when an error is
 * scoped to a single section and the rest of the page can keep working.
 */
export default function InlineError({
  title = "Something went wrong",
  description = "We couldn't load this section. Try again, or come back in a moment.",
  onRetry,
  showHome = false,
  digest,
  className,
}: InlineErrorProps) {
  return (
    <Card
      className={cn("ring-destructive/20", className)}
      role="alert"
      aria-live="assertive"
    >
      <CardHeader>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {digest && (
        <CardContent>
          <p className="text-muted-foreground text-xs font-mono">
            Error reference: {digest}
          </p>
        </CardContent>
      )}
      {(onRetry || showHome) && (
        <CardContent className="flex flex-wrap gap-3 pb-4">
          {onRetry && (
            <button type="button" onClick={onRetry} className={primaryClasses}>
              Try again
            </button>
          )}
          {showHome && (
            <Link href="/" className={secondaryClasses}>
              Home
            </Link>
          )}
        </CardContent>
      )}
    </Card>
  );
}
