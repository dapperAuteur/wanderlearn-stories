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
| Error monitoring | Better Stack via the Sentry SDK (`@sentry/nextjs`), opt-in by DSN       |
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

## Error monitoring

Crashes report to **Better Stack**, which speaks the Sentry protocol, so
`@sentry/nextjs` is the client. It is **entirely opt-in**: with no
`SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` set, no client is initialized, so
nothing is sent and nothing is buffered. See `.env.example` and
`plans/user-tasks/32-betterstack-dsn.md` (local) for provisioning.

| File | Role |
|------|------|
| `sentry.server.config.ts` / `sentry.edge.config.ts` | Per-runtime init, DSN-guarded |
| `src/instrumentation.ts` | `register()` per `NEXT_RUNTIME` + `onRequestError` |
| `src/instrumentation-client.ts` | Browser init + `onRouterTransitionStart` |
| `src/lib/sentry-scrub.ts` | `beforeSend` scrubber (see below) |
| `src/lib/sentry-scrub.test.ts` | Leak tests + over-redaction counter-tests |

Because this is a COPPA product, every event passes through a key-aware
scrubber before it leaves: parent emails, magic-link and consent tokens,
session cookies, auth headers and vendor API keys are redacted, and
`tracesSampleRate` / both replay rates are `0` (no session recording of a
child, ever). Two constraints on that file if you edit it:

- **No regex lookbehind.** It ships in a client chunk and lookbehind is a
  parse error on iOS Safari below 16.4, which would break the chunk even
  with no DSN configured. A committed test enforces this.
- **Assemble test fixtures at runtime.** Never write a secret-shaped
  string literal in a test; push protection rejects the push.

## Uptime monitoring: point monitors at `/api/health`, not `/`

`GET /api/health` (and `HEAD /api/health`) is the liveness endpoint. It is
public, unauthenticated, and runs `select 1` against Neon on every request.

| Outcome | Status | Body |
|---------|--------|------|
| Database answered | `200` | `{"ok":true,"checks":{"db":"ok"}}` |
| Database unreachable, timed out, or `DATABASE_URL` unset | `503` | `{"ok":false,"error":"database_unreachable"}` |

**Configure the Better Stack monitor against `https://<host>/api/health`.**
Pointing it at `/` is what this replaces: the homepage can serve `200` straight
from CDN cache while the database is down, so a green check there proves only
that the edge is up.

Properties worth preserving if you touch `src/app/api/health/route.ts`:

- **Really queries the database.** Not static JSON. The client is imported
  dynamically inside the `try`, so a missing `DATABASE_URL` answers `503` too,
  rather than a `500` whose stack trace could quote the connection string.
- **Never echoes the error.** The `catch` takes no binding, the body is one of
  the two literals above, and the log line is a constant string.
- **Touches no child data.** The probe is a constant, not a table read. It
  never selects or counts a child, guardian, parent, consent, or story row, and
  the response carries no counts, versions, hostnames, or timings.
- **4 second budget** via `Promise.race`, so a hung socket still yields a
  verdict.
- **Never cached.** `force-dynamic`, `revalidate = 0`, `Cache-Control:
  no-store` — and `src/app/sw.ts` puts a `NetworkOnly` rule for `/api/health`
  **ahead of** the `...defaultCache` spread. That matters: serwist's
  `defaultCache` ends with a catch-all that caches every same-origin `GET
  /api/*` with `NetworkFirst` for 24 hours, and serwist takes the first
  matching rule. Without the exclusion an installed PWA client could replay a
  day-old `{"ok":true}` after the database had gone down.

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
