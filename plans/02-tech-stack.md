# 02 — Tech Stack

Refactored to align with the WitUS ecosystem. **All Unity / Unreal references
are obsolete** — the source design doc was written for an earlier engine
choice. Web-only from here on.

## Stack

| Layer            | Technology                                                              |
|------------------|-------------------------------------------------------------------------|
| Framework        | **Next.js 16 (App Router)**, TypeScript strict                          |
| Render runtime   | **A-Frame 1.x** mounted inside a Next.js client component               |
| 3D engine        | Three.js (under A-Frame; direct only when A-Frame falls short)          |
| Styling          | Tailwind CSS v4                                                         |
| Database         | **Neon Postgres** via Drizzle ORM                                       |
| Auth             | **Better Auth** (shared with WitUS ecosystem)                           |
| Spaced rep       | **FlashLearn-AI HTTP API** — no local SR engine                         |
| Media (audio)    | **Cloudinary** (shared tenant with Wanderlearn classic)                 |
| 3D assets        | `.glb` (Draco + KTX2 compression) served from `/public` at MVP, R2 post-MVP |
| Service worker   | Serwist (matching Wanderlearn classic), for offline asset caching       |
| i18n             | Next.js `[lang]` routing — EN at MVP, ES added pre-launch                |
| Testing          | Playwright + axe-core for the chrome around the scene; manual perf testing for the scene itself |

## Why Next.js shell + A-Frame inside it

A-Frame wants control of the document body and the render loop. Next.js
wants control of routing, auth, and data. Coexistence:

- The 360° experience lives in a single client-component route, e.g.
  `app/(stories)/alice/page.tsx`.
- That component imports A-Frame (`'use client'`, `dynamic` import with
  `ssr: false`) and renders `<a-scene>` into a `<div ref>` on mount.
- All non-scene UI (parent gate, library picker, dashboard, account)
  stays as native Next.js + Tailwind. No A-Frame outside the scene route.
- Curriculum JSON, audio URLs, and asset manifests are fetched from
  Next.js Route Handlers (`app/api/curriculum/[bookId]/route.ts`), not
  from a static `/public/story_config.json`.

This gives us:
- Better Auth on the server side, not Firebase on the client.
- Per-user curriculum injection (a logged-in 6-year-old vs. a logged-out
  visitor get different egg sets).
- Standard Next.js caching + ISR for the curriculum payload.

## What changed from the source design doc

| Source doc said                              | Replaced with                                          | Why |
|----------------------------------------------|--------------------------------------------------------|-----|
| Unity WebGL                                  | Next.js + A-Frame                                      | Already the direction in the v2 doc; making it canonical and removing all Unity prose. |
| Vanilla JS, vanilla HTML                     | Next.js TypeScript app, A-Frame inside a client route  | Lets us share auth, DB, and routing with the rest of WitUS. |
| `story_config.json` fetched from disk        | `app/api/curriculum/[bookId]` Route Handler            | Per-user curriculum, server-controlled cache, no asset-pipeline coupling. |
| Firebase Auth + Firestore                    | Better Auth + Neon + Drizzle                           | One auth stack across WitUS; COPPA-compliant parent gate already designable here (plan 07). |
| Local SR / weighting engine in vanilla JS    | FlashLearn-AI API client                               | We own the SR engine elsewhere. Don't fork it. |
| `localStorage` analytics                     | IndexedDB for unsynced events + `/api/events` POST     | localStorage is too small and not tx-safe for kid telemetry. IndexedDB outbox already used by Wanderlearn classic. |
| Parts of the doc using `alert()`             | `<dialog>` overlays inside the scene route             | Already a constraint; restating. |

## Internal package boundaries

Even at MVP, keep these as separate modules so the ecosystem expansion
later doesn't require rewrites:

```
src/
  app/                    # Next.js App Router
    (marketing)/          # /, /about, /privacy, /terms — static
    (parent)/             # /dashboard, /library, /account — auth-required
    (stories)/            # /alice — A-Frame scene route, ssr:false
    api/
      curriculum/[bookId]/route.ts
      events/route.ts
      progress/route.ts
  scene/                  # Pure A-Frame components, no Next imports
    components/
      curriculum-loader.ts
      easter-egg.ts
      gaze-cursor.ts
      hub-teleport.ts
      audio-manager.ts
      ui-overlay.ts
    hubs/
      hub-1-descent/
      hub-2-hall/
  curriculum/             # JSON + zod schemas, no runtime
    schemas/
    alice/
      hub-1.json
      hub-2.json
  flashlearn/             # FlashLearn-AI API client
    client.ts
    types.ts
  db/                     # Drizzle schemas, queries
  auth/                   # Better Auth config + parent-gate logic
```

The `scene/` directory is pure A-Frame — no Next.js imports. That
boundary is what lets us swap rendering tech later (e.g., react-three-fiber)
without touching curriculum, FlashLearn-AI, or auth.

## Things we are explicitly **not** adopting

- **react-three-fiber at MVP.** A-Frame's authoring is closer to HTML and
  the source design doc is built around it. Reconsider for Tier 2/3 when
  interactions get more complex.
- **WebXR-headset-first design.** Headset works as a side-effect; we
  optimize for mobile browser.
- **Photo Sphere Viewer** (which Wanderlearn classic uses). PSV is for
  real-photo tours; Wanderlearn Stories renders synthetic 3D, which is
  A-Frame's strength.
