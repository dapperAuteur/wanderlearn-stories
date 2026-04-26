# Wanderlearn Stories

Working repo name: `learn360`. Product name: **Wanderlearn Stories**.

360° public-domain literary worlds for ages 4–7, with kindergarten-readiness
curriculum mapped to Indiana K standards. Part of the WitUS ecosystem.

> Distinct product from [Wanderlearn classic](../wanderlearn-app/README.md).
> Both live under WitUS; the content rules differ. Don't conflate.

## Authoritative spec

[`plans/`](plans/README.md) — every product, scope, and technical
decision lives there. The plans supersede anything in
[`plans/_archive/`](plans/_archive/).

## Quickstart (local dev)

```bash
nvm use            # Node 24 (see .nvmrc)
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Stack

| Layer            | Technology                                                              |
|------------------|-------------------------------------------------------------------------|
| Framework        | Next.js 16 (App Router), TypeScript strict                              |
| Render runtime   | A-Frame inside a Next.js client route (`ssr: false`)                    |
| Styling          | Tailwind CSS v4                                                         |
| Database         | Neon Postgres + Drizzle ORM (post-bootstrap)                            |
| Auth             | Better Auth (post-bootstrap)                                            |
| Spaced rep       | FlashLearn-AI HTTP API                                                  |
| Media            | Cloudinary (shared WitUS tenant)                                        |
| Hosting          | Vercel                                                                  |

See [plans/02-tech-stack.md](plans/02-tech-stack.md) for rationale.

## Layout

```
src/
  app/                    Next.js App Router routes
    (marketing)/          / about / privacy / terms — static
    (parent)/             /dashboard — auth-required
    (stories)/            /alice — A-Frame scene route, ssr:false
    api/
      curriculum/[bookId]
      events
      progress
      flashlearn/webhook
  scene/                  Pure A-Frame, no Next imports
    components/
    hubs/
  curriculum/             JSON + zod schemas
    schemas/
    alice/
  flashlearn/             FlashLearn-AI API client
  db/                     Drizzle schemas
  auth/                   Better Auth + parent-gate logic
```

## Repo conventions

See [`AGENTS.md`](AGENTS.md). Notably:

- Branch → commit → push → stop. BAM merges.
- Never commit to `main` directly.
- Resolved ecosystem decisions are listed in `AGENTS.md`; the plans
  contain the reasoning.

## Bootstrap status

The repo is at the **scaffold-staged** stage. Next steps for BAM are in
[plans/10-bootstrap-checklist.md](plans/10-bootstrap-checklist.md).
