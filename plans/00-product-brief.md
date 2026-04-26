# 00 — Product Brief

## What it is

**Wanderlearn Stories** is a browser-based 360° immersive learning product
for children ages 4–7, anchored in public-domain literature. Each book is
rebuilt as a series of WebXR "hubs" with gaze-triggered curriculum eggs
mapped to state kindergarten readiness standards.

Flagship book at MVP: *Alice's Adventures in Wonderland*. Two hubs at MVP
(The Descent, The Hall of Doors).

## Position in the WitUS ecosystem

Wanderlearn Stories is a **separate product from Wanderlearn classic.**
Both live under the WitUS umbrella; both deal in immersive learning; the
content rules are incompatible:

| Dimension          | Wanderlearn (classic)                    | Wanderlearn Stories               |
|--------------------|------------------------------------------|-----------------------------------|
| Content source     | Real-place 360° captures + drone footage | Synthetic `.glb` literary worlds  |
| Subject corpus     | Open / location-driven                   | Public-domain literature only     |
| Audience default   | Adult / lifelong learner                 | Children 4–7 (MVP)                |
| Brand promise      | "Real places, real footage, no AI"       | "Step inside a story you've read" |
| Repo               | `wanderlearn-app`                        | `wanderlearn-stories` (this repo) |
| Domain             | `wanderlearn.witus.online`               | `stories.wanderlearn.witus.online`|

The two share: WitUS umbrella branding, Better Auth identity (so a parent
account works in both), the Cloudinary tenant for media, and FlashLearn-AI
as the spaced-repetition backend.

The two do **not** share: codebase, content rules, marketing copy, or
brand promise. Don't write copy that conflates them.

## Product-MVP framing (not audience-of-one)

The originating use case is a kindergarten-transitioning child in BAM's
household. That is a forcing function for the design, not the addressable
market. Treat this as a product MVP from day one:

- **Target user:** parent of a child age 4–7 preparing for kindergarten.
- **Pricing model (post-MVP):** TBD. Likely freemium with one full book
  free + paid additional books, or a flat-fee parent subscription bundled
  with FlashLearn-AI Family.
- **Acquisition (post-MVP):** content marketing through the WitUS network
  + CentenarianOS Academy cross-link (intergenerational learning angle:
  grandparents reading the source book with grandkids in the headset).
- **MVP success gate:** see [08-validation-and-measurement.md](08-validation-and-measurement.md).
  Not "did my kid like it" — comprehension delta on FlashLearn-AI quiz
  next-day, measured across at least 10 households.

## Non-goals (MVP)

- Tier 2 / Tier 3 interaction modes. Architecture supports them; content
  does not exist yet.
- Books beyond *Alice*.
- Multiplayer / social features.
- Native app. Browser-only via WebXR.
- VR-headset-first design. Headset support is a side-effect of A-Frame;
  primary surface is mobile/tablet browser.
- Original 3D asset commissioning. MVP uses procedural / primitive scenes
  styled with baked textures. Custom modeling is post-MVP.
