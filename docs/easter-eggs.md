# Easter eggs — authoring guide

This guide explains how to add or review an **easter egg** in
Wanderlearn Stories. Easter eggs are the smallest unit of learning
content: one curriculum standard, one ~10-second audio moment, one
illustrated overlay card. The product is, almost literally, a
collection of well-tuned eggs inside immersive scenes.

Audiences:

- **Teachers / curriculum reviewers** — sections 1, 2, 5, and 6 are
  the most relevant. You don't need to touch code.
- **Content admins** — the full guide. You'll be writing or
  reviewing JSON files and dropping audio + image assets.
- **Engineers** — sections 3 and 4 will look familiar. Skim the
  authoring checklist (section 5) to understand why content
  reviewers push back on certain ideas.

---

## 1. What an easter egg is

An easter egg is a glowing object inside a 360° hub. The child
gazes at it for two seconds (or taps it on a phone). Then:

1. The world quiets — ambient sound dips.
2. A 6–12 second audio narration plays.
3. A large illustrated overlay card appears with a short title and
   sentence.
4. The card dismisses on gaze-off, tap, or a timeout.

That's the whole interaction. It's deliberately simple — the
product targets ages 4–7, where a kindergarten-readiness "exposure
plus prompt" is exactly the right scope.

Each egg is tied to one **Indiana Kindergarten standard** (e.g.,
`K.NS.1` for counting). The audio narration must deliver the
standard's *verb* — "count," "compare," "identify," "retell." If
the audio doesn't deliver the verb, the egg doesn't ship.

## 2. The mechanic — Tier 1 only at MVP

Wanderlearn Stories has three tiers of interaction designed into
the data layer:

| Tier | Mechanic | Audience |
|------|----------|----------|
| **Tier 1 — Gaze & Listen** | Gaze 2s → audio + overlay card. No reading, no quizzing. | Ages 4–7 (MVP) |
| Tier 2 — Pause & Solve | Click → multiple-choice or fill-blank prompt. | Ages 8–12 (post-MVP) |
| Tier 3 — Sandbox | UI panel with parameters to manipulate. | Ages 13+ (post-MVP) |

**At MVP, only Tier 1 ships.** The schema accepts all three so adding
Tier 2 / Tier 3 later means adding interactions to existing eggs in
JSON, not rewriting code. If you're authoring an egg today, you're
authoring a Tier 1 interaction.

## 3. The schema (annotated)

An egg lives in a hub JSON file at
`src/curriculum/<book-id>/hub-<n>-<name>.json`. Here's a real one
from Alice's Hub 1:

```json
{
  "eggId": "h1-clocks-count",
  "position": [0, 2.2, -3],
  "meshType": "primitive-sphere",
  "subject": "math",
  "standards": [
    {
      "framework": "indiana-k",
      "code": "K.NS.1",
      "description": "Count to 100 by ones and tens."
    }
  ],
  "interactions": [
    {
      "tier": 1,
      "trigger": "gaze",
      "dwellMs": 2000,
      "audioUrl": "/assets/audio/alice/h1-clocks-count.ogg",
      "cardTitle": "Count the clocks!",
      "cardBody": "1, 2, 3, 4, 5… how many clocks are floating past Alice?",
      "cardImageUrl": "/assets/img/alice/h1-clocks-count.png"
    }
  ]
}
```

Field by field:

| Field | What it does |
|-------|--------------|
| `eggId` | Stable identifier, used in IndexedDB progress, FlashLearn-AI session payloads, and the rendered DOM `id`. Convention: `h<hub-number>-<slug>`. Don't rename after shipping. |
| `position` | `[x, y, z]` in meters, A-Frame convention. The camera sits at `[0, 1.6, 0]`. Eggs at `z: -3` are 3 m in front of the user. Vary x/y so they don't overlap. |
| `meshType` | `primitive-sphere`, `primitive-cube`, or `glb`. MVP uses primitives only. `glb` is reserved for post-MVP custom modeling. |
| `subject` | One of `math`, `ela`, `science`, `social`, `art`. Drives the egg's color in the scene (math = rose, ELA = mint, etc.). |
| `standards` | Array of standard codes the egg satisfies. Most eggs map to one; some legitimately cover two. |
| `interactions` | Array of tier-specific interaction descriptors. At MVP, this is a single Tier 1 entry. The runtime picks one based on the child's age band. |

The full schema (with Zod validation) lives at
[`src/curriculum/schemas/curriculum.ts`](../src/curriculum/schemas/curriculum.ts).
Server-side validation rejects malformed JSON before the scene
attempts to render it.

## 4. Adding an egg — step by step

### Prerequisites

- Local dev environment up: `nvm use && pnpm install && pnpm dev`.
- The book you're targeting already has `book.json` and at least one
  `hub-*.json` in `src/curriculum/<book-id>/`. Adding a wholly new
  book is covered in the (future) story-authoring guide.

### Step 1 — Pick the standard

What kindergarten skill does this moment teach? Pull the current
Indiana Department of Education *Indiana Academic Standards:
Kindergarten* PDF and find the matching code. Common ones:

| Code | What it asks |
|------|--------------|
| K.NS.1 | Count to 100 by ones and tens |
| K.NS.2 | Count forward from a given number |
| K.NS.4 | Cardinality (the last number named tells how many) |
| K.RL.1 | Ask and answer questions about a text |
| K.RL.2.2 | Retell familiar stories in sequence |
| K.RV.1 | Use new words from texts and conversations |
| K.M.1 | Compare two objects by length, height, weight |
| K.M.2 | Describe measurable attributes |
| K.G.1 | Identify shapes regardless of orientation |
| K.SE.1 | Identify and manage emotions; turn-taking |
| K.PS.1 | Plan/conduct investigations of motion |

Verify the code against the live IDOE PDF. Codes occasionally drift
between adoptions.

### Step 2 — Pick the moment in the story

The moment must come from the actual book chapter the hub covers.
Don't invent moments — every egg should map back to something a
parent reading the book aloud would recognize. (Plan 06's keep / cut
list is built around this rule.)

### Step 3 — Write the audio script

Read the [child language guide](../plans/child-language-guide.md) if
you have it locally. Key rules:

- Average sentence length 6–10 words.
- Use Dolch K + 1st-grade sight words as the base vocabulary.
- Active voice. No idiom. No metaphor.
- The audio must deliver the standard's *verb* literally.
- Length: 6–12 seconds when read aloud (≈ 18–35 words at a calm
  pace).
- Read aloud to a 4-year-old before shipping. If they trip on a
  word or ask "what does that mean?", rewrite.

### Step 4 — Write the overlay card text

`cardTitle` is short — a few words. `cardBody` repeats the audio
content as text for accessibility (VoiceOver / TalkBack will read it
to non-hearing users). Keep them in sync; don't say one thing in
audio and another on screen.

### Step 5 — Add the JSON entry

Open the appropriate hub file (`src/curriculum/alice/hub-1-descent.json`
for Alice Hub 1) and add a new entry to the `eggs` array, modeled on
the example in section 3. Pick a `position` that doesn't overlap
existing eggs.

### Step 6 — Drop the audio + image assets

Audio: `public/assets/audio/<book-id>/<egg-id>.ogg`. Format spec is
in [`public/assets/audio/<book-id>/README.md`](../public/assets/audio/alice/README.md):
22.05 kHz mono `.ogg` primary, ≤ 12 s, human voice (no AI
narration).

Image: `public/assets/img/<book-id>/<egg-id>.png`. Original art or
public-domain illustrations only. Crush PNGs before committing.

### Step 7 — Validate locally

```bash
pnpm test       # parser round-trips the JSON through Zod
pnpm typecheck  # picks up any TypeScript fallout
pnpm dev        # then visit http://localhost:3000/alice
```

If you see your new egg as a glowing primitive, gaze on it, hear
the narration, and see your overlay — you're done.

### Step 8 — Open a PR

Branch first (never commit to `main`). Push the branch and open a
GitHub PR. The PR triggers a Vercel preview deployment so reviewers
can play the new egg in a real browser.

If the standards mapping is non-obvious, paste your reasoning in the
PR body — the curriculum reviewer (Indiana K teacher, paid per plan
06) will read it before signing off.

## 5. Authoring checklist (curriculum review gate)

Borrowed from plan 06 — these are the questions a reviewer asks.
Every yes; one "no" or "I'm not sure" means the egg doesn't ship.

1. **Which Indiana standard code does it satisfy?** Specific
   subcode, not just "K.M".
2. **Does the audio narration deliver the standard's verb?**
   "Identify," "Compare," "Retell." If you can't point at the verb
   in the script, the egg doesn't deliver the standard.
3. **Can a non-reading 5-year-old complete the interaction without
   parent help?** Tier 1 only — no reading, no clicking targets
   smaller than the child's thumb.
4. **Is `cardImageUrl` (if present) culturally appropriate, free of
   stock photography, and either original art or a public-domain
   illustration?**
5. **Is the moment recognizable from the source book?** A parent
   reading the book aloud should think "oh, that's the bit with
   the…" — not "this didn't happen."
6. **Is the language Dolch K + 1st-grade level?** Run the script
   through a readability checker if unsure.

## 6. What's deliberately *not* an easter egg

Things that have been proposed and cut. Save effort by not
re-proposing:

- **Cheshire Cat "five senses" lesson.** The metaphor doesn't
  deliver any K standard.
- **Punnett square flowers.** Middle-school biology.
- **Caucus race as physics.** No clean K hook.
- **"Drink Me" mixing fractions / pH / ratios.** Every angle is
  above K.
- **Naming "gravity."** K.PS.1 is about *investigating* motion, not
  naming forces.
- **"Curiouser and curiouser" as grammar.** Cute for adults; not a
  K standard.

The product team keeps a longer cut list and a bench-depth list of
alternatives. Ask if you're proposing something that feels close to
one of these.

## 7. Common mistakes

- **Forgetting to update the `cardBody` when you edit the audio
  script.** Keep them in sync. The on-screen text is the
  accessibility fallback.
- **Putting two eggs at overlapping `position` values.** They'll
  z-fight and look broken. Vary the y-axis (height) or move them
  apart.
- **Using stock photography in `cardImageUrl`.** Don't. Original
  art or public-domain only.
- **Picking a standard that's "close enough."** Reviewers will
  push back. Pick the exact code or pick a different moment.
- **Writing the script for adults.** Read aloud to a 4-year-old
  before claiming it's done.
- **Naming the egg with a free-form `eggId`.** Use `h<hub>-<slug>`.
  The id appears in URLs, IndexedDB, FlashLearn-AI payloads, and
  the rendered DOM — it's a stable contract, not a description.

## 8. Where this fits in the bigger picture

An egg is the smallest unit. Above it:

- **Hubs** — collections of eggs in one 360° scene (e.g., "The
  Descent"). Two hubs per book at MVP.
- **Books** — one or more hubs based on a public-domain title.
  *Alice in Wonderland* is the MVP book. Adding *Peter Pan* later
  is JSON-only per the schema design.
- **Tiers** — interaction styles by age. Tier 1 is the only one at
  MVP; Tiers 2 and 3 are wired into the schema and turn on without
  refactoring.

Eggs are also the unit that flows through measurement: when a child
finishes a hub, the eggs they completed (and the standards those
eggs covered) get sent to FlashLearn-AI as a session. Next-day
comprehension is graded card-by-card, then rolled up to standards
for the parent dashboard.

The corollary: each egg is *measured*, not just shipped. If the
science doesn't support the egg teaching the standard, the egg gets
cut even after launch. Standards-aligned, not "kindergarten
themed."

---

Questions, edge cases, or proposed eggs that don't fit the
checklist? Open a draft PR with your idea and ping for review —
that's faster than a long Slack thread, and the diff anchors the
discussion in something concrete.
