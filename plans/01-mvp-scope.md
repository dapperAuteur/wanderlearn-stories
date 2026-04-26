# 01 — MVP Scope

## One sentence

A kindergarten-readiness companion for *Alice's Adventures in Wonderland*:
two 360° hubs, six gaze-triggered curriculum eggs, all aligned to Indiana
Kindergarten standards, working on a 5-year-old phone or tablet.

## Tier

**Tier 1 only — Gaze & Listen, ages 4–7.**

- Mechanic: gaze at a glowing object for 2 seconds.
- Result: the world quiets, audio narration plays a 6–12 second fact, a
  large illustrated overlay card appears, dismissible by gaze-off or tap.
- No reading required. All instruction delivered by audio and image.
- No quiz failure states. Tier 1 is exposure, not assessment.

Tier 2 (Pause & Solve, 8–12) and Tier 3 (Sandbox, 13–18) are out of scope
for code-shipping but in scope for architecture: the JSON schema and
component interfaces in [03-modular-architecture.md](03-modular-architecture.md)
must accommodate them without refactor.

## Hubs (MVP)

Two only.

| Hub | Source chapter | Setting              | Curriculum domain        | Eggs |
|-----|----------------|----------------------|--------------------------|------|
| 1   | Ch. 1          | The Descent          | Math / Counting          | 3    |
| 2   | Ch. 1–2        | The Hall of Doors    | Math / Comparison + ELA  | 3    |

Six eggs total. See [06-curriculum-indiana-k.md](06-curriculum-indiana-k.md)
for the keep/kill list and standards mapping. Hubs 3–5 are post-MVP.

## In scope

- Two `.glb` environment scenes with baked lighting (no real-time lights).
- Audio narration recorded as 22.05 kHz mono `.ogg` (fallback `.mp3`).
- Six interactive eggs with gaze trigger and HTML overlay card.
- Linear hub progression: complete Hub 1 → unlock Hub 2.
- Local progress (which eggs have been viewed) in IndexedDB so re-entry
  resumes correctly without an account.
- Optional account via parent gate (see plan 07) syncs progress to Neon
  via the Wanderlearn Stories API.
- Parent dashboard surface: which eggs the child viewed, how long they
  lingered. No comprehension claim until plan 08 measurement is wired.

## Out of scope (MVP)

- Tier 2 / Tier 3 interactions.
- Books beyond *Alice*.
- VR headset-specific UX (works in headset, not optimized for it).
- Native iOS/Android wrappers.
- Multiplayer / parent co-presence.
- Custom 3D character models. Use stylized primitives + textures.
- Real-time lighting, dynamic shadows, particle systems beyond a single
  glow shader on eggs.
- Adaptive difficulty / spaced repetition logic. (Comes from FlashLearn-AI
  in plan 08, not built locally.)

## Quality gates (must pass to ship)

- Loads to interactive < 4s on a throttled "Slow 4G" Lighthouse profile.
- Sustains ≥ 30 FPS on iPhone SE (2nd gen, 2020) and a $200 Android tablet.
  See [05-performance-budget.md](05-performance-budget.md).
- Zero JS errors in console on cold load and after full hub-1 → hub-2
  traversal.
- Curriculum content swappable by editing JSON, no JS edits, verified by
  changing one egg's standard label and reloading.
- Parent gate blocks under-13 account creation without verifiable parental
  consent. See [07-coppa-compliance.md](07-coppa-compliance.md).
- Accessibility: all overlay cards readable by VoiceOver / TalkBack;
  audio captions available in the card text.
