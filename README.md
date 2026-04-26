# Wanderlearn Stories

Local dir: `wanderlearn-stories`. GitHub repo (planned): `dapperAuteur/wanderlearn-stories`.

360° public-domain literary worlds for ages 4–7, with kindergarten-readiness
curriculum mapped to Indiana K standards. Part of the WitUS ecosystem.

> Distinct product from [Wanderlearn classic](../wanderlearn-app/README.md).
> Both live under WitUS; the content rules differ. Don't conflate.

## Authoritative spec

The detailed planning docs live in a local-only `plans/` directory
(gitignored). Resolved decisions are summarized in
[`AGENTS.md`](AGENTS.md). Ask BAM if you need a specific plan.

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

See plan 02 (tech-stack rationale, local).

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

The repo is at the **scaffold-staged** stage. Next steps for BAM live
in the local `plans/11-bootstrap-checklist.md`.
# wanderlearn-stories
