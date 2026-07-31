/// <reference lib="webworker" />
// Wanderlearn Stories service worker.
//
// Plan 02 mandates Serwist (matching Wanderlearn classic). Plan 05
// requires "service worker pre-cache of .glb + audio after first load
// so re-entry is instant and offline-tolerant." This worker is the
// runtime side of that.
//
// MVP commits to L2 from plans/user-tasks/offline.md: cached-once,
// offline-always for hubs the kid has played. Phase 5 work — perf
// hardening — tunes the cache list once real assets land.

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Activate immediately on install — the user shouldn't have to
  // close all tabs to get the new SW. Plan 05 perf measurement runs
  // cold-cache anyway, so this doesn't hide regressions.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // MUST stay ahead of the defaultCache spread below: serwist takes the FIRST matching
    // rule. defaultCache ships a catch-all for GET requests to any
    // same-origin /api/* path, handled by NetworkFirst with a 24 hour
    // expiration (maxAgeSeconds: 1440 * 60, cacheName "apis"). Left alone
    // that rule caches /api/health, so an installed PWA client could replay
    // a day-old {"ok":true} long after the database went down and hand the
    // uptime monitor a green check for an app that is not serving.
    {
      matcher: ({ sameOrigin, url: { pathname } }) =>
        sameOrigin && pathname === "/api/health",
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
