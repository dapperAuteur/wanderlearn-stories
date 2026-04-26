"use client";

import { useEffect } from "react";
import ErrorActions from "@/components/ErrorActions";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Wanderlearn Stories error boundary:", error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
      <p className="text-sm font-medium text-indigo-400 tracking-wide uppercase">
        Something went wrong
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-white">
        We hit a snag.
      </h1>
      <p className="mt-6 text-lg text-slate-300 max-w-2xl">
        This page didn&apos;t load the way it should. You can try
        again, head back to where you came from, or go to the home page.
      </p>
      {error.digest && (
        <p className="mt-3 text-sm text-slate-500 font-mono">
          Error reference: {error.digest}
        </p>
      )}
      <ErrorActions onReset={reset} />
    </div>
  );
}
