"use client";

import { useEffect, useRef, useState } from "react";
import type { Curriculum, Hub } from "@/curriculum/schemas/curriculum";

interface CurriculumReadyDetail {
  hub: Hub;
  curriculum: Curriculum;
}

/**
 * Mounts the A-Frame scene for Alice in Wonderland's Hub 1.
 * Lazy-loads aframe + scene components via dynamic import so the
 * marketing routes don't ship a-frame's ~250 KB.
 *
 * The DOM is constructed imperatively (innerHTML) to keep React's
 * reconciliation away from A-Frame's internal entity lifecycle.
 *
 * Audio playback (hub narration + per-egg narration) needs a user
 * gesture to bypass mobile autoplay restrictions, so we gate the
 * scene behind a "Begin" button that doubles as the audio-unlock
 * gesture and the visual "ready" cue.
 */
export default function SceneAlice() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [hub, setHub] = useState<Hub | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    const onReady = (e: Event) => {
      const detail = (e as CustomEvent<CurriculumReadyDetail>).detail;
      if (!cancelled) setHub(detail.hub);
    };
    document.addEventListener("wls:curriculum-ready", onReady);

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
      document.removeEventListener("wls:curriculum-ready", onReady);
      audioRef.current?.pause();
      audioRef.current = null;
      if (container) container.innerHTML = "";
    };
  }, []);

  const handleBegin = () => {
    setStarted(true);
    if (hub?.narrationAudio) {
      const audio = new Audio(hub.narrationAudio);
      audioRef.current = audio;
      // Best-effort: 404s when audio file isn't dropped yet are fine.
      audio.play().catch((err) => {
        console.warn("[SceneAlice] narration play failed", err);
      });
    }
  };

  return (
    <div className="relative w-full h-[80vh] min-h-[520px] rounded-xl overflow-hidden ring-1 ring-foreground/10 bg-card">
      {phase === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10"
        >
          Getting the next part…
        </div>
      )}
      {phase === "error" && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-foreground z-10"
        >
          <p className="text-lg font-medium">Oops — let&apos;s try that again.</p>
          <p className="text-sm text-muted-foreground">
            Wanderlearn couldn&apos;t load the scene. Reload the page.
          </p>
        </div>
      )}
      {phase === "ready" && !started && (
        <div
          role="dialog"
          aria-label="Begin the story"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-card/85 backdrop-blur-sm"
        >
          <p className="text-base text-muted-foreground max-w-sm text-center px-4">
            {hub
              ? "Press Begin to step inside. Listen, then look around."
              : "Getting the story ready…"}
          </p>
          <button
            type="button"
            onClick={handleBegin}
            disabled={!hub}
            className="inline-flex items-center min-h-12 px-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-wait"
          >
            {hub ? "Begin" : "Loading…"}
          </button>
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
