import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

/*
 * Server-runtime error monitoring. Loaded by `src/instrumentation.ts`'s
 * register() on the Node runtime.
 *
 * The collector is Better Stack, which speaks the Sentry protocol, so the
 * Sentry SDK is the client and SENTRY_DSN holds the Better Stack source DSN.
 * The DSN value is owned by the Better Stack dashboard: read it from there, do
 * not guess it (see plans/user-tasks/32-betterstack-dsn.md).
 *
 * GUARDED ON THE DSN: with no SENTRY_DSN set, init is skipped entirely and the
 * SDK is inert. Nothing is sent, nothing is buffered, and the app ships and
 * runs exactly as it does today until BAM provisions the source.
 */
const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Errors only. No tracing spend, and this is a COPPA product so no
    // performance sampling of children's sessions until BAM opts in.
    tracesSampleRate: 0,
    // Never auto-attach IP, cookies or account email. The beforeSend scrub is
    // the second line of defense, not the first.
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}
