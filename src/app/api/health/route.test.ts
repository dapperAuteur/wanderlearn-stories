// Guards for the uptime-monitor liveness endpoint.
//
// The failure path is the one worth pinning: it is the response a monitor
// (and anyone else on the internet) sees when the database is down, so it
// must stay a fixed literal that quotes nothing about the failure.

import { promises as fs } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { GET, HEAD } from "./route";

describe("/api/health", () => {
  const saved = process.env.DATABASE_URL;

  beforeAll(async () => {
    // Warm the modules the route imports dynamically. Vitest transforms them
    // on first import, which on a cold run costs more than the route's own
    // 4 second budget and would make the timeout, not the env throw, the
    // thing under test.
    await Promise.all([import("@/db/client"), import("drizzle-orm")]);
  });

  beforeEach(() => {
    // No connection string is the cheapest way to force the failure path
    // without a live database: the dynamic import inside the probe throws.
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved;
  });

  it("answers 503 with a fixed body when the database is unreachable", async () => {
    const res = await GET();

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      ok: false,
      error: "database_unreachable",
    });
  });

  it("leaks nothing about the failure, the schema, or any person", async () => {
    const res = await GET();
    const body = await res.text();

    // The whole response, verbatim. Anything not in this literal is a leak.
    expect(body).toBe('{"ok":false,"error":"database_unreachable"}');

    for (const forbidden of [
      "DATABASE_URL",
      "postgres",
      "neon",
      "child",
      "guardian",
      "parent",
      "consent",
      "stack",
    ]) {
      expect(body.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it("catches a missing connection string instead of waiting out the timeout", async () => {
    // A missing DATABASE_URL throws inside the dynamically imported client.
    // That throw has to land in the route's own catch and answer 503 at once;
    // if it escaped, Next would answer 500 with a stack trace instead.
    const started = Date.now();
    const res = await GET();

    expect(res.status).toBe(503);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("is never cacheable", async () => {
    const res = await GET();
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("answers HEAD with the same verdict and no body", async () => {
    const res = await HEAD();

    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(await res.text()).toBe("");
  });

  it("excludes itself from the service worker before serwist's /api/ catch-all", async () => {
    // serwist takes the first matching runtimeCaching rule, and defaultCache
    // ships a NetworkFirst catch-all for /api/* with a 24 hour expiration.
    // If this ordering ever flips, an installed PWA replays a stale "ok".
    const sw = await fs.readFile(
      path.join(process.cwd(), "src", "app", "sw.ts"),
      "utf8",
    );

    const exclusion = sw.indexOf('pathname === "/api/health"');
    const spread = sw.indexOf("...defaultCache");

    expect(exclusion).toBeGreaterThan(-1);
    expect(spread).toBeGreaterThan(-1);
    expect(exclusion).toBeLessThan(spread);
    expect(sw).toContain("new NetworkOnly()");
  });
});
