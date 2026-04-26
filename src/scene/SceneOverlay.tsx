"use client";

import { useEffect, useRef, useState } from "react";
import type { Standard } from "@/curriculum/schemas/curriculum";

interface OverlayContent {
  eggId: string;
  title: string;
  body: string;
  imageUrl?: string;
  standards: Standard[];
}

/**
 * The HTML <dialog> overlay that opens when an easter-egg fires.
 * Lives outside the A-Frame scene as a React island, listens for
 * the `wls:overlay-show` custom event from easter-egg.ts. Plan 02
 * forbids alert(); this is the canonical kid-facing prompt surface.
 */
export default function SceneOverlay() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [content, setContent] = useState<OverlayContent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<OverlayContent>).detail;
      setContent(detail);
      dialogRef.current?.showModal();
    };
    document.addEventListener("wls:overlay-show", handler);
    return () => document.removeEventListener("wls:overlay-show", handler);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-w-md rounded-xl bg-card text-card-foreground p-6 ring-1 ring-foreground/10 backdrop:bg-foreground/40"
      onClose={() => setContent(null)}
    >
      {content && (
        <>
          {content.imageUrl && (
            <img
              src={content.imageUrl}
              alt=""
              className="mb-4 rounded-lg w-full max-h-48 object-cover"
              onError={(e) => {
                // Placeholder URLs 404 until assets land — hide the broken-image icon.
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{content.body}</p>
          {content.standards.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              <span className="sr-only">Indiana K standards:</span>
              {content.standards.map((s) => s.code).join(" · ")}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              autoFocus
              onClick={close}
              className="inline-flex items-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Done
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
