"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mounts the A-Frame scene for Alice in Wonderland's Hub 1.
 * Lazy-loads aframe + scene components via dynamic import so the
 * marketing routes don't ship a-frame's ~250 KB.
 *
 * The DOM is constructed imperatively (innerHTML) to keep React's
 * reconciliation away from A-Frame's internal entity lifecycle —
 * mixing the two leads to flickering and re-init bugs.
 */
export default function SceneAlice() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    (async () => {
      try {
        await import("aframe");
        await Promise.all([
          import("./components/curriculum-loader"),
          import("./components/easter-egg"),
        ]);

        if (cancelled || !container) return;

        container.innerHTML = `
          <a-scene
            embedded
            vr-mode-ui="enabled: false"
            cursor="rayOrigin: mouse; fuse: true; fuseTimeout: 2000"
            raycaster="objects: .gaze-target"
            curriculum-loader="bookId: alice; hubId: h1-descent"
            class="w-full h-full"
          >
            <a-camera position="0 1.6 0" look-controls wasd-controls-enabled="false">
              <a-cursor color="#C73E5C" raycaster="objects: .gaze-target"></a-cursor>
            </a-camera>

            <a-sky color="#FDF8EE"></a-sky>
            <a-light type="ambient" color="#FFFFFF" intensity="0.65"></a-light>
            <a-light type="directional" position="1 4 2" intensity="0.7"></a-light>
          </a-scene>
        `;

        setPhase("ready");
      } catch (err) {
        console.error("[SceneAlice] mount failed", err);
        if (!cancelled) setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div className="relative w-full h-[80vh] min-h-[520px] rounded-xl overflow-hidden ring-1 ring-foreground/10 bg-card">
      {phase === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center text-muted-foreground"
        >
          Getting the next part…
        </div>
      )}
      {phase === "error" && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-foreground"
        >
          <p className="text-lg font-medium">Oops — let&apos;s try that again.</p>
          <p className="text-sm text-muted-foreground">
            Wanderlearn couldn&apos;t load the scene. Reload the page.
          </p>
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
