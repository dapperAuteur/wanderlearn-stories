import { type VercelConfig } from "@vercel/config/v1";

// Vercel project configuration. Plan 04 §"vercel.ts skeleton".
// TypeScript replaces vercel.json so we get type checking + dynamic
// logic + env access (e.g., conditional crons per environment).

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",
  headers: [
    // Static assets are immutable across deploys — cache aggressively.
    // Same names + content always return the same bytes; new content
    // means new filenames, so a long max-age never serves stale.
    {
      source: "/assets/audio/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/assets/img/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/assets/models/(.*).glb",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
  // Crons land in Phase 3 (per plan 07 §"Retention"): a daily job that
  // purges events older than 18 months. Path will be
  // `/api/cron/purge-events`. Adding when the route exists, not before.
};
