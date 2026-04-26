"use client";

import { useEffect } from "react";

const primaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const secondaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Wanderlearn Stories global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <p className="text-sm font-medium text-indigo-400 tracking-wide uppercase">
            Something went wrong
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            The app couldn&apos;t start.
          </h1>
          <p className="mt-6 text-base text-slate-300">
            Wanderlearn Stories ran into an error before the page could
            load. Reloading usually fixes it.
          </p>
          {error.digest && (
            <p className="mt-3 text-sm text-slate-500 font-mono">
              Error reference: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button type="button" onClick={reset} className={primaryClasses}>
              Reload
            </button>
            <a href="/" className={secondaryClasses}>
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
