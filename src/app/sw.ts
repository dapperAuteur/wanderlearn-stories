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
import { Serwist } from "serwist";

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
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
