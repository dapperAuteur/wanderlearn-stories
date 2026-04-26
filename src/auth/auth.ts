// Better Auth configuration. Lazy-init: nothing touches the database
// until `getAuth()` is called for the first time. That keeps the dev
// server from crashing when DATABASE_URL is missing (the common state
// pre-/vercel:bootstrap).
//
// Phase 3 wires this into:
//   - app/api/auth/[...all]/route.ts (Better Auth's catch-all handler)
//   - the parent gate UI flow per plan 08 §"Verifiable parental consent flow"
//   - middleware that gates (parent)/* routes by session presence

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "@/db/schema";

let cached: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Better Auth: DATABASE_URL is not set. Run /vercel:bootstrap and " +
        "`vercel env pull .env.local` before initializing auth.",
    );
  }
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Better Auth: BETTER_AUTH_SECRET is not set. Generate one with " +
        '`openssl rand -base64 32` and add it via `vercel env add`.',
    );
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  return betterAuth({
    secret,
    baseURL:
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    // Email + password is intentionally off — plan 08's email-plus VPC
    // flow uses magic links, not stored passwords. Magic-link plugin
    // wiring (with Mailgun) lands when MAILGUN_* env is provisioned.
    emailAndPassword: { enabled: false },
  });
}

/** Lazily-constructs the Better Auth instance. */
export function getAuth() {
  if (!cached) cached = create();
  return cached;
}
