"use client";

import { useEffect } from "react";

const primaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg bg-[#C73E5C] text-white hover:bg-[#A03048] font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C73E5C]";

const secondaryClasses =
  "inline-flex items-center min-h-11 px-5 rounded-lg border border-[#ECE3D0] hover:bg-[#F5EDD9] text-[#3F1A4A] font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C73E5C]";

// global-error replaces the root layout entirely (own <html>/<body>).
// Theme tokens may not resolve if the layout failed before <body> mounted,
// so we hardcode hex colors that approximate the cream/amber palette.
// Visual cohesion matters more here than maintainability — this file
// renders only when something is already broken.
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
      <body className="antialiased min-h-screen bg-[#FDF8EE] text-[#3F1A4A] flex items-center justify-center px-6 font-sans">
        <div className="max-w-2xl text-center">
          <p className="text-sm font-medium text-[#C73E5C] tracking-wide uppercase">
            Something went wrong
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-[#3F1A4A]">
            The app couldn&apos;t start.
          </h1>
          <p className="mt-6 text-base text-[#7E6273]">
            Wanderlearn Stories ran into an error before the page could
            load. Reloading usually fixes it.
          </p>
          {error.digest && (
            <p className="mt-3 text-sm text-[#7E6273] font-mono">
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
