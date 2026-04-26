# 11 — Conversation Handoff

This project's design conversation happened in a Claude Code session
opened from `/Users/bam/Code_NOiCloud/ai-builds/gemini/witus`. Before
implementation work begins, the conversation should move *into* the
project's own directory:
`/Users/bam/Code_NOiCloud/ai-builds/gemini/wanderlearn/learn360`.

This doc tells a fresh chat in that directory how to pick up cold.

## What's done

- All product, scope, and technical decisions captured in
  [plans/](README.md). The plans are the source of truth, not this
  doc and not the source design docs.
- `AGENTS.md` + `CLAUDE.md` at the repo root point at the plans and
  list the resolved ecosystem decisions.
- Source design docs (`360Gem Alice in Wonderland Docs ver 2.md`,
  `gemini-code-1777169028788.md`) archived under
  `plans/_archive/`. They are reference only.
- Next.js 16 scaffold staged on the `chore/scaffold` branch:
  `package.json`, `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.nvmrc`,
  minimal `src/app/` (layout + placeholder home + globals.css), and
  the placeholder directory structure from plan 02.
- A `chore/scaffold` branch exists locally with two commits. **No
  remote yet.** GitHub repo creation + first push is BAM's task per
  [10-bootstrap-checklist.md](10-bootstrap-checklist.md).
- The agent's auto-memory has a namespace seeded for this directory:
  `~/.claude/projects/-Users-bam-Code-NOiCloud-ai-builds-gemini-wanderlearn-learn360/memory/`
  with the ecosystem-wide feedback rules (branch→commit→push→stop,
  no sycophancy) and a project memory pointing at this plans
  directory.

## What's not done (move-the-chat-blockers: none)

Everything below can happen from a fresh chat in
`learn360/`. Nothing in this list needs to happen *before* moving.

- GitHub repo creation + first push (plan 10, section C).
- `/vercel:bootstrap` run (plan 10, section D1).
- Env var provisioning (plan 10, section D2).
- DNS CNAME (plan 10, section D3).
- Implementation work (everything else in `plans/`).

## What's not done (launch-blockers, captured for later)

See plan 10, section E. Tracked here so they aren't forgotten:

- Indiana K teacher review of the six MVP eggs.
- Privacy policy + terms reviewed by counsel.
- Better Auth parent-gate implementation.
- FlashLearn-AI integration wiring.
- Verification of standard codes against current IDOE PDF.
- Asset authoring (`.glb` hubs, audio narration).
- Pilot cohort recruitment for the comprehension baseline.

## How a fresh chat in `learn360/` should orient itself

The first thing the new conversation should do:

1. Read [plans/README.md](README.md) end-to-end. It's an index pointing
   at every decision.
2. Read [AGENTS.md](../AGENTS.md). Resolved decisions + ecosystem rules.
3. Read [10-bootstrap-checklist.md](10-bootstrap-checklist.md) to see
   where the user is in the repo-creation arc.
4. Check git state with `git status` and `git log --oneline -20` to
   see whether `chore/scaffold` has been pushed / merged yet.
5. Only after all of that, propose the next step.

If the user's first message in the new chat is "what's next?" or
"continue from the previous session," the answer is: pick up at the
next unchecked item in plan 10. Likely B1 (CLI upgrade) or C1
(`gh repo create`).

## Things the previous chat agreed on but didn't write down elsewhere

Captured here so they aren't lost between sessions:

- BAM does not want sycophancy or cheerleading. Default to hard
  critique. Surfaced in the no-sycophancy memory.
- "Wanderlearn Stories" is the product name; `learn360` is a working
  local-directory name. They don't have to match.
- Wanderlearn classic (`wanderlearn-app`) is a separate product, not a
  parent. Don't bundle them, don't share copy beyond the WitUS umbrella.
- The originating use case (BAM's child) is a forcing function for
  design but not the addressable market. Treat as product MVP.
- FlashLearn-AI owns the spaced-repetition engine for the WitUS
  ecosystem. Wanderlearn Stories calls its API; it does not reimplement.
- Source design docs contained Unity / Firebase / Sole-Code-Writer
  Gem-tooling artifacts. Those are obsolete. The plans supersede them.
- Performance budget gates on iPhone SE 1st gen, not a current flagship.
- COPPA applies; the engineering posture is data minimization first,
  then verifiable parental consent (email-plus at MVP).
- Success metric is FlashLearn-AI next-day comprehension delta. Gaze
  duration is a diagnostic, not a metric.
