# 03 — Modular Architecture

Goal: ship **Tier 1 only** at MVP, but keep Tier 2 (Pause & Solve) and
Tier 3 (Sandbox) as a content-and-config addition rather than a rewrite.

## The contract: tier is data, not code

A hub does not know what tier it is. An egg does not know what tier it is.
Both ask the `CurriculumLoader` for the appropriate **interaction
descriptor** based on the active user profile.

```
User profile (age, prior performance)
       ↓
CurriculumLoader → emits InteractionDescriptor
       ↓
Egg component reads descriptor → instantiates the matching Interaction
       ↓
Interaction (GazeAndListen | PauseAndSolve | Sandbox) handles input + UI
```

Adding Tier 2 means: implement the `PauseAndSolve` interaction class +
add Tier 2 entries to the curriculum JSON. No change to hub code, no
change to the egg component, no change to the loader.

## JSON schema (curriculum payload)

```ts
// curriculum/schemas/curriculum.ts
import { z } from "zod";

export const Standard = z.object({
  framework: z.literal("indiana-k"),       // expand: "indiana-1", "ccss-k", etc.
  code: z.string(),                        // e.g., "K.NS.1"
  description: z.string(),
});

export const InteractionTier1 = z.object({
  tier: z.literal(1),
  trigger: z.literal("gaze"),
  dwellMs: z.number().min(1000).max(5000),
  audioUrl: z.string().url(),
  cardTitle: z.string(),
  cardBody: z.string(),
  cardImageUrl: z.string().url().optional(),
});

export const InteractionTier2 = z.object({
  tier: z.literal(2),
  trigger: z.literal("click"),
  prompt: z.string(),
  answerType: z.enum(["multiple-choice", "fill-blank"]),
  choices: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  successAudioUrl: z.string().url(),
  failureAudioUrl: z.string().url(),
});

export const InteractionTier3 = z.object({
  tier: z.literal(3),
  trigger: z.literal("ui-panel"),
  panelId: z.string(),                     // ref into a tool registry
  parameters: z.record(z.unknown()),
});

export const Interaction = z.discriminatedUnion("tier", [
  InteractionTier1, InteractionTier2, InteractionTier3,
]);

export const Egg = z.object({
  eggId: z.string(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  meshType: z.enum(["primitive-sphere", "primitive-cube", "glb"]),
  meshSrc: z.string().optional(),          // required if meshType === "glb"
  subject: z.enum(["math", "ela", "science", "social", "art"]),
  standards: z.array(Standard),
  // Multiple tier interactions can coexist; loader picks one per user.
  interactions: z.array(Interaction).min(1),
});

export const Hub = z.object({
  hubId: z.string(),
  bookId: z.string(),
  chapterRange: z.string(),
  environmentModel: z.string(),            // /assets/models/...
  skybox: z.string().optional(),
  ambientAudio: z.string().url().optional(),
  narrationAudio: z.string().url(),
  textExcerpt: z.string(),
  eggs: z.array(Egg),
});

export const Curriculum = z.object({
  bookId: z.string(),
  title: z.string(),
  publicDomainSource: z.object({
    title: z.string(),
    edition: z.string(),
    sourceUrl: z.string().url(),           // e.g. Project Gutenberg
  }),
  hubs: z.array(Hub),
});
```

`zod` parsing happens server-side in the curriculum Route Handler, so a
malformed JSON file fails fast and never reaches the client.

## CurriculumLoader (A-Frame component)

```ts
// scene/components/curriculum-loader.ts
AFRAME.registerComponent("curriculum-loader", {
  schema: { bookId: { type: "string" } },

  async init() {
    const res = await fetch(`/api/curriculum/${this.data.bookId}`);
    const curriculum = await res.json();         // already validated server-side
    this.curriculum = curriculum;
    this.userProfile = await this.fetchUserProfile();
    this.el.emit("curriculum-ready", { curriculum });
  },

  // Called by easter-egg components when they initialize.
  resolveInteraction(eggId) {
    const egg = this.findEgg(eggId);
    return this.pickInteractionForUser(egg, this.userProfile);
  },

  pickInteractionForUser(egg, profile) {
    const tier = this.tierFor(profile);          // age → 1 | 2 | 3
    return egg.interactions.find(i => i.tier === tier)
        ?? egg.interactions.find(i => i.tier === 1);   // graceful fallback
  },

  tierFor(profile) {
    if (!profile || profile.ageBand === "4-7") return 1;
    if (profile.ageBand === "8-12") return 2;
    return 3;
  },
});
```

At MVP, only Tier 1 interactions exist in the curriculum JSON, so
`pickInteractionForUser` always returns the Tier 1 one. The control flow
is identical to what it will be at Tier 2/3 — so adding tiers later does
not require touching this code.

## Easter egg component (tier-agnostic)

```ts
// scene/components/easter-egg.ts
AFRAME.registerComponent("easter-egg", {
  schema: { eggId: { type: "string" } },

  init() {
    this.loader = this.el.sceneEl.components["curriculum-loader"];
    this.el.sceneEl.addEventListener("curriculum-ready", () => {
      const interaction = this.loader.resolveInteraction(this.data.eggId);
      this.interaction = createInteraction(interaction, this.el);
    });
  },

  remove() {
    this.interaction?.destroy();
  },
});

// Factory dispatches on tier; new tiers register here.
function createInteraction(descriptor, el) {
  switch (descriptor.tier) {
    case 1: return new GazeAndListen(descriptor, el);
    case 2: return new PauseAndSolve(descriptor, el);
    case 3: return new Sandbox(descriptor, el);
  }
}
```

`GazeAndListen` is implemented at MVP. `PauseAndSolve` and `Sandbox`
are not — but the dispatch site is already there.

## Story Swapper (adding new books)

The whole curriculum payload is resolved by `bookId`. Adding *Peter Pan*
later means:

1. Drop new `.glb` hub assets into the asset pipeline.
2. Author `curriculum/peter-pan/hub-*.json` with the same schema.
3. The route `app/api/curriculum/peter-pan` already works (param-driven).
4. The library page lists books from the DB; insert a `books` row.

No code changes inside `scene/`.

## What's deliberately not modular at MVP

- Asset pipeline: hub `.glb` files are hand-built. Procedural environment
  generation is post-MVP.
- Audio narration: human-recorded only. No TTS, no AI-generated voices —
  the WitUS umbrella's "no fabricated voices" rule applies here too,
  even though the *worlds* are synthetic.
- Standards framework adapter: hardcoded to `"indiana-k"` at MVP. Add
  CCSS / state-by-state later as additional `Standard` framework values
  + a UI picker.
