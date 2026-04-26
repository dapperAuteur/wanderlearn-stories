# 09 — Source Doc Cleanup

The original spec lives at
[../360Gem Alice in Wonderland Docs ver 2.md](../360Gem%20Alice%20in%20Wonderland%20Docs%20ver%202.md)
and at
[../gemini-code-1777169028788.md](../gemini-code-1777169028788.md).

Both are kept as historical reference but are **not authoritative**. The
authoritative spec for Wanderlearn Stories is the `plans/` directory.

This doc lists the cleanup edits to make to those source files (or to a
single consolidated archive copy) before they're filed as `_archive/`.

## Strip from the source docs

These artifacts belong to the Gemini Gem authoring tool, not the
product. Remove or move to a `gem-tooling/` directory outside the
project root:

- The `<instructions id="literary_world_architect_webxr">` blocks. Both
  copies — there are two near-identical blocks.
- The "Sole Code Writer" / "Master World Architect" persona language.
- The "Contributing Guide: Human-AI Collaboration" section. It's
  authoring-tool guidance, not product spec.
- The "Bug Reporting Guide: How to Invoke Scrutiny" section. Same.
- The "Prompt Arsenal" at the bottom. Move to `gem-tooling/`.

## Refactor (replace with corrected content)

| Source-doc statement                                              | Replace with                                                                                  |
|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| "Unity-based, browser-accessible 360° virtual tour"               | "Web-native A-Frame / Three.js 360° virtual tour, served from a Next.js application."         |
| Any reference to `.cs` scripts (`PerspectiveController.cs`, `CurriculumDatabase.cs`, `IEasterEgg.cs`, `UIManager.cs`) | "A-Frame component" + corresponding TS module name from plan 02. |
| "Firebase Authentication and Firestore (JS SDK)"                  | "Better Auth + Neon Postgres (Drizzle ORM)."                                                  |
| "Mock Firebase via `localStorage`"                                | "IndexedDB outbox + `/api/events` POST. After parental consent only (plan 07)."               |
| "Build the Spaced Recall Algorithm in vanilla JS"                 | "Call the FlashLearn-AI HTTP API. The SR engine is owned by FlashLearn-AI."                   |
| "ScriptableObjects and JSON" (Unity pattern)                      | "Zod-validated JSON curriculum payloads served from Route Handlers."                          |
| "Punnett Square Flowers", "Food Pyramid", "pH balance", "Thermal conduction", "Color mixing", "Vinegar + baking soda" | Remove from MVP scope. Park in a `future/` doc with a note that they're not Indiana K standards-aligned. |
| "Cheshire Cat 'Five Senses'" lesson                               | Delete entirely. The metaphor doesn't deliver the standard.                                   |
| "Books are windows to other worlds" → Literacy lesson             | Replace with "title and cover recognition" framing per plan 06.                               |
| "Gravity is the invisible hug" → Physics K lesson                 | Remove from K. Park for Tier 2+. K standard K.PS.1 is about *investigation*, not naming gravity. |
| "Audio: highly compressed `.mp3` or `.ogg`"                       | "22.05 kHz mono `.ogg` (primary), `.mp3` (fallback). Streamed, not preloaded."                |
| "Frame Rate: 60 FPS Stable (Mobile)"                              | Tiered budget per plan 05: 30 FPS low-end, 60 FPS mid-range.                                  |
| "Texture Size 1024 px max"                                        | Same ceiling, but add the 96 MB total texture-memory cap.                                     |

## Keep as-is (still correct)

- Data-driven mandate (no hardcoded curriculum facts).
- DOM-efficient render-loop guidance (cache selectors in `init`).
- A-Frame component lifecycle correctness (clean up listeners in `remove`).
- KTX2 / Draco compression mandate.
- Object pooling guidance.
- Baked-lighting mandate.
- "Never use `alert()`" constraint.
- Modular architecture intent (even though some details have been
  superseded).

## Self-contradictions to resolve

The source doc has internal contradictions; these are the resolutions.

| Contradiction                                                                  | Resolution                                                  |
|-------------------------------------------------------------------------------|-------------------------------------------------------------|
| "Unity-based" vs. "strictly WebXR/A-Frame"                                     | Web only. Strike all Unity references.                      |
| "Sole Code Writer (you)" vs. a contributor / collaborator workflow             | The product spec has no AI persona. Strike all "Sole Code Writer" language. |
| Tier 1 (4–7) MVP vs. high-school terminal velocity examples in the same PRD    | MVP = Tier 1 only. Tier 2/3 examples move to `future/`.     |
| Eggs framed for kindergarten vs. content sized for middle/high school          | Cut anything not in Indiana K. See plan 06 for the keep list. |
| "Hub Expansion" with chemistry / genetics / thermodynamics                     | Out of scope at any tier we currently plan to ship. Park for a different product line if revisited. |

## Process

1. Make a copy of the source docs as `plans/_archive/source-doc-v2.md`
   (preserve the original, untouched).
2. Apply the strip + refactor edits to the *authoritative* doc location
   if we decide to keep one. Otherwise, mark the originals as ARCHIVED
   at the top and let `plans/` be the single source of truth.
3. The Gem-tooling sections move to a separate path entirely, e.g.
   `~/Code_NOiCloud/ai-builds/gemini/_gem-personas/literary-webxr.md`,
   so they are not confused with product spec by future readers.

## Why not just edit the source doc in place

Because the source doc is two things at once: a *product spec* and a
*Gemini Gem authoring artifact*. Mixing the two is what produced the
self-contradictions in the first place. Separating them costs a few
minutes now and prevents the next future-BAM (or a contributor) from
reading "Sole Code Writer" and thinking it's a project rule.
