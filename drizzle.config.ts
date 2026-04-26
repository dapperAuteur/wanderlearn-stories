import { defineConfig } from "drizzle-kit";

// Drizzle Kit config for migration generation + push.
// Reads DATABASE_URL at runtime (set by `vercel env pull .env.local`
// after /vercel:bootstrap provisions the Neon Postgres branch).
//
// Useful commands once DATABASE_URL is set:
//   pnpm dlx drizzle-kit generate    # create migration SQL from schema diffs
//   pnpm dlx drizzle-kit push        # apply schema to the DB without migrations (dev)
//   pnpm dlx drizzle-kit migrate     # run pending migrations
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://placeholder",
  },
});
