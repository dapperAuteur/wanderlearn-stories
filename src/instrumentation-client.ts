import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

/*
 * Client-runtime error monitoring. Reads the PUBLIC DSN, which is inlined into
 * the bundle at build time, so it is a separate variable from the server's
 * SENTRY_DSN by design.
 *
 * GUARDED: with no NEXT_PUBLIC_SENTRY_DSN the SDK is never initialised, so
 * nothing is sent and nothing changes for a child using the app.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // Errors only. No tracing, and NO session replay: recording a 4-to-7 year
    // old's session is exactly the thing plan 08 says we do not do.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}

/** Instruments App Router client navigations. No-op when not initialised. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
