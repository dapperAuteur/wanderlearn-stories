import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

/*
 * Next.js instrumentation hook. Loads the right error-monitoring config per
 * runtime and reports server-side App Router errors via onRequestError.
 * Everything stays inert without a SENTRY_DSN (see the two configs).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("../sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("../sentry.edge.config");
}

/**
 * Captures errors thrown while rendering or serving a request. We tag the
 * router kind so a scene-route crash (A-Frame, client-only) is separable from a
 * Route Handler crash without a DB lookup in the error path and without
 * carrying any parent or child PII. captureRequestError does the rest, and the
 * beforeSend scrub still runs over whatever it collects.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  Sentry.withScope((scope) => {
    scope.setTag("router.kind", context.routerKind);
    Sentry.captureRequestError(err, request, context);
  });
};
