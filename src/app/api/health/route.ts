// Liveness endpoint for uptime monitoring.
//
// Point Better Stack (and any other monitor) here, not at `/`. The homepage
// can answer 200 straight from CDN cache while the database is face down, so
// a green check on `/` proves only that Vercel's edge is up. This route runs
// the cheapest possible real query against Neon, so a 200 means the app can
// actually reach its data.
//
// Privacy: this is a children's app holding COPPA-shaped data. The probe is
// `select 1` — a constant, not a table read. It never selects, counts, or
// otherwise touches a child, guardian, parent, consent, or story row, and the
// response body carries no counts, sizes, versions, hostnames, or timings,
// because a public number is a public number even when it looks harmless.
//
// The catch is intentionally bare (no error binding) and the log line is a
// fixed string. A Neon failure message routinely quotes the connection
// string, so neither the response nor the log may ever carry `err.message`.

import { NextResponse } from "next/server";

/** Never prerender, never revalidate: a cached health check is a lie. */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * Budget for the whole probe. Long enough to ride out a Neon cold start,
 * short enough that the monitor gets a verdict rather than a hung socket.
 */
const PROBE_TIMEOUT_MS = 4_000;

/**
 * Belt and braces against every cache between here and the monitor: the CDN,
 * any proxy, and the browser. The service worker is handled separately in
 * src/app/sw.ts, which must exclude this path from serwist's `/api/`
 * catch-all or an installed PWA client can replay a stale "ok".
 */
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
} as const;

/**
 * Runs `select 1` against the database. Resolves true if the database
 * answered inside the budget, false for every other outcome (unreachable,
 * timed out, or DATABASE_URL missing). Never throws, never rethrows, and
 * never surfaces the underlying error to its caller.
 */
async function isDatabaseReachable(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    // Dynamic import so a module-load or env-validation throw is caught here
    // and answers 503, rather than escaping as a 500 whose stack trace could
    // quote the connection string.
    const probe = (async () => {
      const [{ getDb }, { sql }] = await Promise.all([
        import("@/db/client"),
        import("drizzle-orm"),
      ]);
      await getDb().execute(sql`select 1`);
    })();

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("health probe timed out")),
        PROBE_TIMEOUT_MS,
      );
    });

    // Whichever promise loses the race can still settle afterwards. Park a
    // no-op handler on both so the loser can never raise an unhandled
    // rejection and take the function down after we have already answered.
    probe.catch(() => {});
    timeout.catch(() => {});

    await Promise.race([probe, timeout]);
    return true;
  } catch {
    // No binding, and a constant string: nothing derived from the error can
    // reach the log sink.
    console.error("[health] database liveness probe failed");
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const ok = await isDatabaseReachable();

  return ok
    ? NextResponse.json(
        { ok: true, checks: { db: "ok" } },
        { status: 200, headers: NO_STORE_HEADERS },
      )
    : NextResponse.json(
        { ok: false, error: "database_unreachable" },
        { status: 503, headers: NO_STORE_HEADERS },
      );
}

/** Same verdict, no body: some monitors probe with HEAD. */
export async function HEAD() {
  const ok = await isDatabaseReachable();

  return new Response(null, {
    status: ok ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}
