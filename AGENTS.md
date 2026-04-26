# Wanderlearn Stories — agent rules

Working repo name: `learn360` (placeholder). Product name:
**Wanderlearn Stories**. Distinct product from Wanderlearn classic;
both live under WitUS.

**Authoritative spec:** the [`plans/`](plans/README.md) directory.
This file is a quick-reference for agents; the plans are the source
of truth.

## Parent: WitUS — "Live Long. Work Free."

Siblings under the WitUS umbrella (witus.online):

- **CentenarianOS** (centenarianos.com) — longevity OS.
- **Wanderlearn classic** (wanderlearn.witus.online) — 360° place-based
  learning, **real captured footage only**.
- **Wanderlearn Stories** (this repo, target subdomain
  `stories.wanderlearn.witus.online`) — synthetic literary worlds for
  ages 4–7.
- **FlashLearn-AI** — spaced-repetition engine for the ecosystem.
- **Contractor-OS / Work.WitUS.Online** — work-free side.
- **witus-inbox** — internal utility.

## Brand position (read before writing copy)

Wanderlearn classic's promise: real places, real footage, no AI-generated
content, no fabricated voices. Wanderlearn Stories is **synthetic
literary worlds**. Same umbrella name, different product, incompatible
content rules. Don't conflate them in copy or code.

See [plans/00-product-brief.md](plans/00-product-brief.md).

## Resolved ecosystem decisions

| Decision                | Resolution                                                                           |
|-------------------------|--------------------------------------------------------------------------------------|
| Tech stack              | Next.js 16 + A-Frame inside a client route. TypeScript strict. **Not Unity.**        |
| Auth                    | Better Auth, shared with WitUS. **Not Firebase.**                                    |
| DB                      | Neon Postgres + Drizzle. **Not Firestore.**                                          |
| Spaced rep              | FlashLearn-AI HTTP API. **Do not reimplement the SR engine.**                        |
| Media (audio + assets)  | Cloudinary, shared WitUS tenant.                                                     |
| Hosting                 | Vercel. Auto-deploy from `main`; preview per branch.                                 |
| Domain                  | `stories.wanderlearn.witus.online`.                                                  |
| MVP tier                | Tier 1 only (Gaze & Listen, ages 4–7). Architecture supports Tier 2/3 by JSON.       |
| MVP hubs                | Two: The Descent, The Hall of Doors.                                                 |
| MVP eggs                | Six total, all mapped to Indiana K standards. Kill list in plan 06.                  |
| Curriculum standards    | Indiana Kindergarten (IDOE codes). Verified by an Indiana-licensed K teacher.        |
| Audience framing        | Product MVP for parents of children 4–7. Not audience-of-one.                        |
| Compliance              | COPPA. Verifiable parental consent before any child data collection.                 |
| Success metric          | Next-day comprehension delta via FlashLearn-AI. Not gaze duration.                   |
| Performance baseline    | Must run on iPhone SE 1st gen at ≥ 30 FPS. See plan 05.                              |
| Source design doc       | Reference only. Not authoritative. See plan 09 for the cleanup list.                 |

## Branch → commit → push → stop (BAM merges)

Applies to every repo in the BAM ecosystem.

- Before any `git commit`, confirm `git branch --show-current` is **not**
  `main`. If it is, branch first (`feat/`, `fix/`, `chore/`, etc.).
- Commit automatically when branch work is done — don't wait to be asked.
- After `git commit`, run `git push -u origin <branch>` (`-u` on first
  push; later pushes are plain `git push`).
- Never `git checkout main && git merge`. Never `git push --force` to a
  shared branch (`--force-with-lease` on your own branch is fine when
  local history was legitimately rewritten).
- When done, tell BAM the branch name + a one-line summary. BAM merges
  from GitHub.
- One-off "merge X into main" instructions from BAM override this
  default; the default returns immediately afterward.

## Tech constraints (carry-overs from the design doc, refactored)

- A-Frame + Three.js mounted inside a Next.js client route (`'use client'`,
  `dynamic` import with `ssr: false`).
- Strict separation: scene code (`src/scene/`) has no Next.js imports;
  app code has no direct A-Frame imports outside the scene route.
- Data-driven only — no hardcoded curriculum facts. All content from
  zod-validated JSON served by Route Handlers.
- Performance budget per [plans/05-performance-budget.md](plans/05-performance-budget.md).
  Mobile budgets are hard limits, not targets. Low-end mobile (iPhone SE
  1st gen, Fire HD 8) is the gate.
- No `alert()`. Custom HTML overlays (`<dialog>`) only.
- No Unity / Unreal — strictly WebXR.
- No third-party advertising / behavioral SDKs anywhere on the site.
  Plan 07 explains why.

## What the original design doc got wrong (don't propagate)

- Unity / C# scripts — refactored to A-Frame + TS in plan 02.
- Firebase Auth + Firestore — replaced with Better Auth + Neon.
- "Build the SR engine in vanilla JS" — replaced with FlashLearn-AI API.
- Multi-tier MVP scope (4–18) — replaced with Tier 1 only at MVP.
- Curriculum-as-metaphor (Cheshire Cat = "five senses", "books are
  windows" = literacy) — replaced with Indiana K standards mapping in
  plan 06.
- Middle-school content tagged for kindergarten (Punnett squares, pH,
  thermal conduction) — cut. See plan 06.
- "Sole Code Writer" Gem persona language — strip per plan 09.
- 1024 px texture cap with no total memory ceiling — replaced with
  tiered budget incl. 96 MB low-end memory ceiling (plan 05).
- Gaze duration as the success metric — replaced with next-day
  comprehension delta via FlashLearn-AI (plan 08).
