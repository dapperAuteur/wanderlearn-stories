# Wanderlearn Stories — plans index

**Wanderlearn Stories.** Local dir: `wanderlearn-stories`. Distinct product
from Wanderlearn classic. Both live under WitUS.

Read in order. Each doc resolves a specific gap from the design-doc critique
(2026-04-25).

| #  | Doc                                                       | Resolves                                                                                |
|----|-----------------------------------------------------------|-----------------------------------------------------------------------------------------|
| 00 | [product-brief](00-product-brief.md)                      | Sub-brand position; product MVP (not audience-of-one).                                  |
| 01 | [mvp-scope](01-mvp-scope.md)                              | Tier 1 only (ages 4–7); two hubs; Indiana Kindergarten standards.                       |
| 02 | [tech-stack](02-tech-stack.md)                            | Next.js shell + A-Frame; Better Auth + Neon + Drizzle; kill Unity / Firebase refs.      |
| 03 | [modular-architecture](03-modular-architecture.md)        | Tier 1 → Tier 2/3 expansion without refactor; JSON schema; CurriculumLoader interface.  |
| 04 | [deployment](04-deployment.md)                            | Vercel; `stories.wanderlearn.witus.online`; env strategy.                               |
| 05 | [performance-budget](05-performance-budget.md)            | Older-device targets; budgets revised down for low-end mobile.                          |
| 06 | [curriculum-indiana-k](06-curriculum-indiana-k.md)        | Egg-by-egg mapping to IN K standards; keep/kill list.                                   |
| 06b| [future-eggs](06b-future-eggs.md)                         | Bench-depth + Hub 3–5 starter eggs; what we'd resist.                                   |
| 07 | [coppa-compliance](07-coppa-compliance.md)                | Parent-gated consent; data minimization; retention; no third-party PII sharing.         |
| 08 | [validation-and-measurement](08-validation-and-measurement.md) | FlashLearn-AI next-day comprehension check; gaze duration is supplementary only.   |
| 09 | [source-doc-cleanup](09-source-doc-cleanup.md)            | Strip Sole Code Writer persona; remove Unity/Firebase refs from source doc.             |
| 10 | [bootstrap-checklist](10-bootstrap-checklist.md)          | User-task list with explicit instructions: GitHub repo, Vercel, env, DNS.               |
| 11 | [conversation-handoff](11-conversation-handoff.md)        | What's done, what's left, how a fresh chat in this dir picks up.                        |

## What is *not* in scope here

- Wanderlearn classic. Different repo, different brand promise (real-place
  field capture). See [../../wanderlearn-app/README.md](../../wanderlearn-app/README.md).
- Tier 2 (ages 8–12) and Tier 3 (ages 13–18) MVP code. Architecture supports
  them; content does not exist yet.
- Books beyond *Alice's Adventures in Wonderland*. The "Story Swapper"
  schema in plan 03 is the contract for adding new books later.
