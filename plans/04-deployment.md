# 04 — Deployment

## Hosting

**Vercel.** Same provider as witus.online, wanderlearn.witus.online, and
the rest of the WitUS sites. Auto-deploy from `main` for production;
preview deploys for every branch (which matches the
branch→commit→push→stop ecosystem rule).

## Domain

- **Primary:** `stories.wanderlearn.witus.online`
- **Apex / parent zone:** `wanderlearn.witus.online` already exists for
  Wanderlearn classic; add a subdomain CNAME record pointing to Vercel.
- **No alias to** `witus.online` or `wanderlearn.witus.online` apex —
  Wanderlearn Stories is a separate product (per plan 00).

## Project layout on Vercel

- Vercel project name: `wanderlearn-stories`
- Team: `aweful1s-projects` (matches witus-online project)
- Framework preset: **Next.js 16** — should auto-detect, but follow the
  witus-online precedent and commit a `vercel.ts` (the new
  TypeScript-based replacement for `vercel.json`) to be explicit.

## `vercel.ts` skeleton

```ts
// vercel.ts
import { type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",
  // Long-running scene routes need extra memory for the asset pipeline,
  // not the runtime. Keep function defaults; static GLBs go through
  // /public + Cloudinary.
  headers: [
    // .glb is gzip-incompressible; let CDN keep it long.
    { source: "/assets/models/(.*).glb", headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ]},
    // Audio similarly.
    { source: "/assets/audio/(.*)", headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ]},
  ],
};
```

## Environment variables

All set via `vercel env` (per the WitUS ecosystem default), pulled with
`vercel env pull .env.local` for dev. **Never commit `.env`.**

| Name                              | Scope                  | Source                        |
|-----------------------------------|------------------------|-------------------------------|
| `DATABASE_URL`                    | Production + Preview   | Neon project                  |
| `BETTER_AUTH_SECRET`              | Production + Preview   | generated                     |
| `BETTER_AUTH_URL`                 | Production + Preview   | `https://stories.wanderlearn.witus.online` (or preview URL) |
| `FLASHLEARN_API_BASE`             | All                    | FlashLearn-AI service base    |
| `FLASHLEARN_API_KEY`              | Production + Preview   | issued from FlashLearn-AI     |
| `CLOUDINARY_CLOUD_NAME`           | All                    | shared WitUS Cloudinary tenant|
| `CLOUDINARY_API_KEY`              | Production + Preview   | shared tenant                 |
| `CLOUDINARY_API_SECRET`           | Production + Preview   | shared tenant                 |
| `MAILGUN_API_KEY`                 | Production + Preview   | for parent-consent emails     |
| `MAILGUN_DOMAIN`                  | All                    | e.g. `mg.witus.online`        |
| `NEXT_PUBLIC_PUBLIC_URL`          | All                    | `https://stories.wanderlearn.witus.online` |
| `NEXT_PUBLIC_PARENT_GATE_AGE`     | All                    | `13` (COPPA threshold)        |

OIDC tokens for Neon/Cloudinary access are preferred over long-lived
secrets where the service supports them. Default Vercel OIDC is on for
this project.

## Branch / preview policy

- **`main`** auto-deploys to production.
- Every other branch auto-deploys a preview URL.
- BAM does the merge into `main` from GitHub. Per the ecosystem rule,
  agents do not merge.
- Preview URLs are how BAM evaluates a branch before merging — keep them
  representative (real Cloudinary, real FlashLearn-AI sandbox env, real
  Neon preview branch via Neon-Vercel integration).

## Bootstrap order (first-time setup)

When the repo is first initialized:

1. `git init` and create the GitHub repo (`dapperAuteur/wanderlearn-stories`).
2. Run the `vercel:bootstrap` skill to provision Neon (preview-branched),
   link Cloudinary, and pull env to `.env.local`.
3. Add `BETTER_AUTH_SECRET`, `FLASHLEARN_API_KEY`, `MAILGUN_*` manually.
4. Add the DNS record (`stories` CNAME → Vercel) on the parent zone host.
5. First push to a branch generates a preview; merge to `main` cuts prod.

## Rollback

- Use Vercel's instant rollback to a previous production deployment.
- Database migrations are one-way; if a migration is being shipped
  alongside, apply it on a Neon preview branch first and only promote to
  production after the deployment is green.
- Cron jobs (none at MVP; FlashLearn-AI handles spaced-rep scheduling)
  would go in `vercel.ts` `crons` if added later.
