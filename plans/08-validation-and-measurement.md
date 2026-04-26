# 08 — Validation and Measurement

## The claim under test

"Wanderlearn Stories teaches kindergarten-readiness skills."

Until that claim is measured, it is marketing, not a feature. The MVP
ships with the measurement built in.

## Why gaze duration is not the metric

The source doc treated *gaze duration on an egg* as the engagement /
learning signal. It isn't. A 5-year-old staring blankly at a glowing
sphere is indistinguishable from a 5-year-old learning. Long gazes also
correlate with confusion, distraction, the camera being held still by a
parent, or the child wandering off.

We log gaze duration, but only as a **diagnostic** — to find eggs the
child returned to repeatedly, eggs that were never noticed, and pacing
issues. It is not the success metric.

## The success metric: next-day comprehension delta

After a child completes a hub, FlashLearn-AI is the test:

1. When the child finishes Hub 1, the Wanderlearn Stories backend posts
   the egg list + standard codes the child experienced to FlashLearn-AI:
   `POST /api/v1/sessions` with the source = `wanderlearn-stories` and
   the metadata pointing at the standards.
2. FlashLearn-AI generates an age-appropriate flashcard deck (3–5 cards)
   for those standards, scoped to the parent's child profile, scheduled
   for the next calendar day.
3. The parent receives an email (Mailgun) inviting them to do a
   ~3-minute FlashLearn-AI session with the child the next day.
4. FlashLearn-AI reports back per-card correctness via webhook to
   Wanderlearn Stories, keyed on the same child profile (after VPC,
   per plan 07).
5. Comprehension delta = % correct on first-attempt cards keyed to the
   eggs the child experienced.

## What "successful MVP" means quantitatively

The MVP is judged successful when, across at least 10 households:

- ≥ 60 % of next-day FlashLearn-AI cards correct on first attempt for
  children who completed both hubs. (Baseline: ~25 % for kids who never
  saw the hubs, on the same cards. Need to measure this baseline pre-
  launch with a small control group.)
- ≥ 70 % of children complete Hub 1 in a single session without parent
  intervention beyond the consent flow.
- ≥ 50 % of children return for a second session within 7 days.

If the comprehension delta isn't there, the experience isn't teaching.
That's a more important signal than retention or NPS.

## What we're not measuring (yet)

- Long-term retention (weeks-out spaced recall). FlashLearn-AI handles
  this automatically once the child has cards in their deck; we don't
  build separate analytics for it.
- A/B variants of egg copy. Premature; need baseline first.
- Cross-child comparison ("is your kid behind?"). We will not surface
  this. Comparative readiness is a parent anxiety vector, not a
  pedagogically responsible signal.

## Diagnostic events we *do* log

All scoped to the consented child profile, retained per plan 07:

| Event                  | Purpose                                       |
|------------------------|-----------------------------------------------|
| `hub.entered`          | Funnel — where do kids drop off?              |
| `hub.completed`        | Completion rate per hub.                      |
| `egg.gazed`            | Gaze start; with hub, eggId, dwellMs.         |
| `egg.triggered`        | Gaze met dwell threshold; card opened.        |
| `egg.dismissed`        | How card was closed (gaze-off, tap, timeout). |
| `audio.completed`      | Did the narration play to end?                |
| `session.duration`     | Total session length.                         |
| `session.error`        | Any caught JS error during the session.       |

These ride to `/api/events`. Stored in Neon. Aggregated nightly to a
diagnostic dashboard for BAM. Not exposed to parents — parents see
mastery, not raw events.

## What parents see (the dashboard)

The parent-facing dashboard at `/dashboard` shows:

- Which standards the child has been exposed to.
- For each standard: "exposed" → "practiced" (FlashLearn-AI seen) →
  "demonstrated" (≥ 80 % across last 5 first-attempts).
- Suggested next session ("Bring Alice back to play Hub 2 — your child
  hasn't tried `K.M.1` yet.").
- Their COPPA controls (review / export / delete / refuse further).

No vanity metrics. No streaks. No leaderboards. The dashboard's job is
to help the parent decide whether to put the kid in the headset again.

## Pre-launch validation steps

Before opening signups beyond the BAM-household pilot:

1. **Baseline measurement.** Run the FlashLearn-AI cards on a control
   set of 10 children ages 4–7 who *haven't* used Wanderlearn Stories.
   Record their first-attempt correctness as the baseline. (Recruit
   through the WitUS network; obtain VPC.)
2. **Pilot cohort.** Onboard 10 households who have. Run the same cards
   the day after their session.
3. **Signal check.** If pilot cohort first-attempt correctness is not
   meaningfully above baseline, do not launch publicly. Iterate on
   curriculum or pacing first.
4. **Indiana-K teacher review.** Per plan 06, get sign-off on the
   standards mapping before any of the above runs.

## Engineering hooks

- `flashlearn/client.ts` — typed FlashLearn-AI client; functions:
  `createSession({ childId, standards, sourceContext })`,
  `getMastery({ childId })`, `deleteChild({ childId })` for cascade.
- `app/api/events/route.ts` — receives client events, writes to Neon.
- `app/api/flashlearn/webhook/route.ts` — receives FlashLearn-AI
  card-result webhooks, updates mastery materialized view.
- Nightly Vercel cron `/api/cron/aggregate-diagnostics` — recomputes
  funnel + completion stats for the diagnostic dashboard.
