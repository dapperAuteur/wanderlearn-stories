"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const SceneAlice = dynamic(() => import("@/scene/SceneAlice"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center min-h-[60vh] text-muted-foreground"
    >
      Getting the next part…
    </div>
  ),
});

const SceneOverlay = dynamic(() => import("@/scene/SceneOverlay"), {
  ssr: false,
});

export default function AliceHub2Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="text-xs font-medium text-primary tracking-wide uppercase">
          Alice&apos;s Adventures in Wonderland
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Hub 2 — The Hall of Doors
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          &ldquo;There were doors all round the hall, but they were all
          locked.&rdquo; Look around and find the glowing things. Stare at one
          for two seconds to listen.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            Preview
          </span>{" "}
          At MVP launch this hub requires a parent account. Until then it&apos;s
          open for testing.
        </p>
      </div>

      <SceneAlice hubId="h2-hall" />
      <SceneOverlay />

      <aside className="mt-8 rounded-xl border border-border bg-secondary/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary tracking-wide uppercase">
            Hub 1 — The Descent
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Want to start over? Hub 1 is always open.
          </p>
        </div>
        <Link
          href="/alice"
          className="inline-flex items-center min-h-11 px-5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Back to Hub 1
        </Link>
      </aside>
    </div>
  );
}
