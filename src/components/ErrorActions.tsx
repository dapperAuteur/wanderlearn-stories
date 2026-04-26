"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ErrorActionsProps {
  onReset?: () => void;
  resetLabel?: string;
}

const primaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const secondaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function ErrorActions({
  onReset,
  resetLabel = "Try again",
}: ErrorActionsProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mt-10 flex flex-wrap items-center gap-4">
      {onReset && (
        <button type="button" onClick={onReset} className={primaryClasses}>
          {resetLabel}
        </button>
      )}
      <button type="button" onClick={handleBack} className={secondaryClasses}>
        Go back
      </button>
      <Link href="/" className={secondaryClasses}>
        Home
      </Link>
    </div>
  );
}
