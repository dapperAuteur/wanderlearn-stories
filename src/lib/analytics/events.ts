/**
 * Event taxonomy for Wanderlearn Stories.
 *
 * The ecosystem shares ONE PostHog project, separated by the `app` property that
 * posthog-provider registers on load. Two rules keep that project readable, and both
 * are cheap now and expensive to retrofit once data has landed:
 *
 *   1. `snake_case`, object first, verb in past tense — `route_viewed`.
 *   2. NEVER put the app name in the event name. `stories_route_viewed` is wrong: it
 *      makes the same action from two apps look like two events and kills the
 *      cross-app comparison that sharing a project exists to enable. The `app`
 *      property already carries that.
 *
 * Shared lifecycle events (the SHARED_EVENTS block) use identical names in every
 * ecosystem app, so "where do people fall out of sign-in" is answerable across all of
 * them at once. Do not rename these here without renaming them everywhere.
 *
 * Child-safety note: this is a site for ages 4–7. Capture is anonymous (no identify(),
 * memory persistence, no autocapture, no replay). Never add a property that could
 * identify a child or a parent — no names, emails, free text, or account ids.
 *
 * Contract: witus-online lib/analytics/INTEGRATE.md and its plans/26.
 */

/** Matches this app's slug in witus lib/identity/clients.ts. Every event carries it. */
export const ANALYTICS_APP = "stories";

/**
 * Events with identical names across every ecosystem app. Names are contractual.
 */
export const SHARED_EVENTS = {
  signinStarted: "signin_started",
  signinSucceeded: "signin_succeeded",
  signinFailed: "signin_failed",
} as const;

/**
 * Events specific to Wanderlearn Stories. Kept to the route view for now; story-level
 * events get added here, by slug, when there is a question they answer.
 */
export const EVENTS = {
  /** An explicit route view. capture_pageview is off — Next's client router would
   *  fire it once and then lie — so route changes are reported deliberately. */
  routeViewed: "route_viewed",
  ...SHARED_EVENTS,
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
