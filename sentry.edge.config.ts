import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

/*
 * Edge-runtime error monitoring (any route or proxy running on the edge).
 * Loaded by `src/instrumentation.ts`'s register() on the edge runtime.
 * Same DSN guard as the server config: inert with no SENTRY_DSN.
 */
const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}
