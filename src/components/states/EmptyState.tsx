import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional decorative icon — keep small (~size-8) and quiet. */
  icon?: ReactNode;
  action?: EmptyStateAction;
  /** Override the surrounding Card (e.g., to remove the ring). */
  className?: string;
}

const actionClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Use for "no data yet" surfaces — *not* "no results" (which is a
 * filtered-list case and should look different to avoid implying the
 * data is missing).
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardHeader className="items-center">
        {icon && (
          <div
            aria-hidden="true"
            className="text-muted-foreground mb-2 flex h-12 w-12 items-center justify-center"
          >
            {icon}
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {action && (
        <CardContent className="flex justify-center pb-4">
          {action.href ? (
            <Link href={action.href} className={actionClasses}>
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className={actionClasses}
            >
              {action.label}
            </button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
