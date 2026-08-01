// Lazy Drizzle/Neon client.
//
// Same lazy-init contract as src/auth/auth.ts: nothing touches the network
// or reads env until getDb() is first called, so importing this module can
// never crash a route or the dev server when DATABASE_URL is unset.
//
// Callers that must not 500 on a missing env (the /api/health liveness
// probe, for one) should import this module dynamically inside their own
// try block: then the "DATABASE_URL is not set" throw lands in the same
// catch as a real connection failure.

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "@/db/schema";

let cached: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Deliberately no interpolation: this message can reach a log sink, and
    // the value it is complaining about is a connection string.
    throw new Error("DATABASE_URL is not set.");
  }
  return drizzle(neon(url), { schema });
}

/** Lazily-constructs the shared Drizzle client. */
export function getDb() {
  if (!cached) cached = create();
  return cached;
}
