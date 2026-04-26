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

export default function AlicePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="text-xs font-medium text-primary tracking-wide uppercase">
          Alice&apos;s Adventures in Wonderland
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Hub 1 — The Descent
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          &ldquo;Down, down, down. Would the fall never come to an end?&rdquo;
          Look around and find the glowing things. Stare at one for two seconds
          to listen.
        </p>
      </div>

      <SceneAlice />
      <SceneOverlay />

      <aside className="mt-8 rounded-xl border border-border bg-secondary/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary tracking-wide uppercase">
            Hub 2 — The Hall of Doors
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Locked. A grown-up can sign in to unlock the next world.
          </p>
        </div>
        <Link
          href="/account"
          className="inline-flex items-center min-h-11 px-5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Sign in (parents)
        </Link>
      </aside>
    </div>
  );
}
