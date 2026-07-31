import type { ErrorEvent } from "@sentry/nextjs";

/*
 * Sentry `beforeSend` scrubber for Wanderlearn Stories.
 *
 * This app is COPPA-scoped, so a crash report is a data-egress path: an event
 * can pass through a parent's email address, a magic-link or parental-consent
 * token, a Better Auth session cookie, or the FlashLearn-AI / Cloudinary /
 * Mailgun credentials. None of that may leave the app. Everything here is a
 * pure, dependency-free pass so the SAME code runs on the Node runtime, the
 * edge runtime, and inside the browser bundle.
 *
 * BROWSER CONSTRAINT (do not break this): this module is imported by
 * `src/instrumentation-client.ts`, so it ships in a client chunk and must
 * PARSE on old mobile Safari. Regex lookbehind assertions are a SyntaxError on
 * iOS Safari below 16.4 and would break that chunk for every visitor even with
 * no DSN configured. So there are none here: where a pattern needs to know what
 * preceded a match, it CAPTURES the preceding character and re-emits it.
 * `sentry-scrub.test.ts` scans this file and fails if a lookbehind appears.
 *
 * It never returns null: we still want the crash signal, just with the
 * credentials and the child/parent PII stripped out.
 */

const REDACTED = "[redacted]";
const REDACTED_EMAIL = "[redacted-email]";
const MAX_DEPTH = 8;

/* ------------------------------------------------------------------ names -- */

/**
 * Splits a key into lowercase word segments so sensitivity is decided PER
 * SEGMENT instead of by substring. Substring matching is what makes a naive
 * scrubber redact `design` (contains "sig"), `keyboard` (contains "key"), or
 * `encode` (contains "code"). Segment matching does not.
 *
 * Separators are `_`, `-`, `.`, spaces AND camelCase humps, so
 * `FLASHLEARN_API_KEY`, `x-api-key` and `clientSecret` all normalise the same
 * way. This is also why the free-text label regex below cannot rely on `\b`:
 * `_` is a word character, so `\bSECRET\b` never matches the SECRET in
 * `STRIPE_WEBHOOK_SECRET`.
 */
function segments(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase());
}

/** Sensitive on their own, in any position. */
const ALWAYS_SECRET = new Set([
  "secret", "secrets", "password", "passwords", "passwd", "pwd", "passphrase",
  "token", "tokens", "apikey", "authorization", "credential", "credentials",
  "cookie", "cookies", "jwt", "bearer", "otp", "passcode", "dsn", "hmac", "pin",
]);

/**
 * Sensitive only next to a qualifier. Bare `key`, `code`, `hash` and `sig` are
 * far too common in this codebase to redact on sight: React list keys, Indiana
 * kindergarten standard codes (`K.RL.2.1`), Cloudinary asset hashes. Note that
 * `state` is deliberately absent: an OAuth `state` value is a CSRF nonce echo,
 * not a credential, and keeping it readable helps triage.
 */
const QUALIFIED_SECRET = new Set(["key", "keys", "code", "codes", "signature", "sig", "hash", "salt", "nonce"]);
const SECRET_QUALIFIER = new Set([
  "api", "secret", "private", "access", "refresh", "signing", "sign", "encryption",
  "enc", "auth", "session", "client", "webhook", "invite", "verification", "verify",
  "reset", "consent", "magic", "magiclink", "recovery", "csrf", "xsrf", "ingest",
  "publishable", "service", "admin", "bearer",
]);

/**
 * Compounds that arrive glued together when a name carries no separators at
 * all (`clientsecret`). Tested as a substring of the separator-stripped name,
 * which is safe precisely because every entry is a long compound: no ordinary
 * English word contains one of these the way `design` contains `sig`.
 */
const GLUED_SENSITIVE = [
  "apikey", "apisecret", "clientsecret", "accesstoken", "refreshtoken", "idtoken",
  "sessiontoken", "authtoken", "privatekey", "secretkey", "signingkey",
  "webhooksecret", "ingestsecret", "magiclink", "resettoken", "invitetoken",
  "consenttoken", "bearertoken", "accesscode", "csrftoken", "xsrftoken",
  "emailaddress", "childname", "parentname", "guardianname", "studentname",
  "fullname", "firstname", "lastname", "username", "displayname", "phonenumber",
];

/**
 * PII. `sendDefaultPii: false` already stops the SDK attaching most of this;
 * these catch what application code puts into `extra` or a breadcrumb by hand.
 * Bare `name` is NOT sensitive (component names, hub names and book names are
 * the most useful triage data we have), only a qualified one.
 */
const ALWAYS_PII = new Set([
  "email", "emails", "phone", "telephone", "mobile", "ssn", "dob", "birthdate", "birthday",
]);
const QUALIFIED_PII = new Set(["name", "names"]);
const PII_QUALIFIER = new Set([
  "child", "children", "kid", "parent", "guardian", "student", "learner",
  "first", "last", "full", "display", "user", "given", "family", "legal",
]);

/**
 * Whether a NAME means "the value beside me is a credential or PII".
 *
 * `mode: "param"` is for query-string parameters and HTTP header names, where a
 * bare `key`, `code`, `sig` or `hash` really is an API key / OAuth exchange
 * code / request signature. `mode: "data"` is for payload and context keys,
 * where those same bare words are usually innocent, so a qualifier is required.
 */
function isSensitiveName(name: string, mode: "param" | "data"): boolean {
  const segs = segments(name);
  if (segs.length === 0) return false;

  const glued = segs.join("");
  if (GLUED_SENSITIVE.some((word) => glued.indexOf(word) !== -1)) return true;
  if (segs.some((s) => ALWAYS_SECRET.has(s) || ALWAYS_PII.has(s))) return true;

  if (segs.some((s) => QUALIFIED_SECRET.has(s))) {
    if (mode === "param") return true;
    if (segs.some((s) => SECRET_QUALIFIER.has(s))) return true;
  }
  if (segs.some((s) => QUALIFIED_PII.has(s)) && segs.some((s) => PII_QUALIFIER.has(s))) return true;

  return false;
}

/* ------------------------------------------------------------------- text -- */

const SEG = "[A-Za-z0-9]{1,32}";
// Bounded repetition on purpose: an unbounded nested quantifier over arbitrary
// error text is a backtracking risk, and this regex runs in the browser.
const SECRET_WORD =
  "(?:secrets?|passwords?|passwd|pwd|passphrase|tokens?|api[_.-]?keys?|authorization|" +
  "credentials?|cookies?|jwt|bearer|otp|passcode|dsn|hmac|signature|" +
  "client[_.-]?secret|access[_.-]?token|refresh[_.-]?token|id[_.-]?token|" +
  "session[_.-]?token|auth[_.-]?token|private[_.-]?key|secret[_.-]?key|" +
  "signing[_.-]?key|webhook[_.-]?secret|ingest[_.-]?secret)";
const LABEL = `(?:${SEG}[_.-]){0,4}${SECRET_WORD}(?:[_.-]${SEG}){0,4}`;

/**
 * `LABEL = value` / `LABEL: value` in free text, e.g. a thrown message that
 * interpolates an env var. The left boundary is `(^|[^A-Za-z0-9])` rather than
 * `\b` so it spans `_`: with `\b` this would never fire on
 * `BETTER_AUTH_SECRET=...`. The boundary is captured and re-emitted because
 * lookbehind is banned here (see the file header).
 */
const LABELLED_VALUE = new RegExp(
  `(^|[^A-Za-z0-9])(${LABEL})(\\s*(?:[:=]|=>)\\s*)(?:"[^"\\n]*"|'[^'\\n]*'|[^\\s,;&)\\]}"']+)`,
  "gi",
);

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** A JWT always opens with a base64url `{"alg"` header, so `eyJ` is precise. */
const JWT = /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;

/** `postgres://user:password@host` (DATABASE_URL is the one that matters). */
const URL_CREDENTIALS = /([A-Za-z][A-Za-z0-9+.-]*:\/\/)([^/\s:@]{1,128}):([^/\s@]{1,256})@/g;

/**
 * Vendor-prefixed credentials. These are matched by their literal prefix, not
 * by "looks random", which is the whole point: a Cloudinary public id and a
 * signing secret have the same shape, so shape alone would redact content ids.
 */
const VENDOR_SECRETS: RegExp[] = [
  /sk_(?:live|test)_[A-Za-z0-9]{8,}/g, // Stripe secret key
  /whsec_[A-Za-z0-9]{8,}/g, // Stripe webhook signing secret
  /cloudinary:\/\/[^\s"']+/g, // Cloudinary URL: api key AND secret
  /key-[a-f0-9]{32}/gi, // Mailgun private api key
  /(?:ghp|gho|ghu|ghs)_[A-Za-z0-9]{20,}/g, // GitHub token
  /github_pat_[A-Za-z0-9_]{20,}/g, // GitHub fine-grained PAT
  /AIza[A-Za-z0-9_-]{20,}/g, // Google api key
  /xox[abposr]-[A-Za-z0-9-]{10,}/g, // Slack token
];

/** Redacts credential-shaped and PII-shaped substrings of free text. */
function scrubText(text: string): string {
  if (!text) return text;
  let out = text;
  out = out.replace(URL_CREDENTIALS, (_m, scheme: string, user: string) => `${scheme}${user}:${REDACTED}@`);
  for (const pattern of VENDOR_SECRETS) out = out.replace(pattern, REDACTED);
  out = out.replace(JWT, REDACTED);
  out = out.replace(
    LABELLED_VALUE,
    (_m, boundary: string, label: string, separator: string) => `${boundary}${label}${separator}${REDACTED}`,
  );
  out = out.replace(EMAIL, REDACTED_EMAIL);
  return out;
}

/**
 * Redacts the VALUES of credential-named `name=value` pairs. Runs on a bare
 * query string as happily as on a full URL, because `event.request.query_string`
 * is a SEPARATE field from `event.request.url` and a bare query string is not a
 * parseable URL: a URL-only pass silently ships `token=` and `code=`.
 */
function scrubQueryPairs(queryish: string): string {
  return queryish.replace(
    /(^|[?&;])([^=&;#?\s]{1,128})=([^&;#\s]*)/g,
    (whole, separator: string, rawName: string, value: string) => {
      if (!value) return whole;
      let name = rawName;
      try {
        name = decodeURIComponent(rawName);
      } catch {
        // Malformed percent-encoding: judge the raw name instead.
      }
      return isSensitiveName(name, "param") ? `${separator}${rawName}=${REDACTED}` : whole;
    },
  );
}

/**
 * Path segments that carry a credential. Path CONTEXT, not shape: a curriculum
 * id (`/api/curriculum/alice-in-wonderland`) and a consent token are the same
 * shape, so we redact only the segment FOLLOWING a known credential segment
 * rather than every opaque string in the path.
 */
const TOKEN_PATH =
  /\/(verify|verification|confirm|activate|accept|invite|reset|consent|magic-link|magiclink|unsubscribe|token|otp|callback)\/([^/?#\s]+)/gi;

/** Scrubs a URL: token-bearing path segments, then credential query values. */
function scrubUrl(url: string): string {
  const q = url.indexOf("?");
  const path = q === -1 ? url : url.slice(0, q);
  const query = q === -1 ? "" : url.slice(q);
  const safePath = scrubText(path.replace(TOKEN_PATH, (_m, kind: string) => `/${kind}/${REDACTED}`));
  return safePath + (query ? scrubText(scrubQueryPairs(query)) : "");
}

/* ------------------------------------------------------------- structures -- */

/**
 * Keys whose string value is a URL, so the path-context pass applies to them
 * too. Without this a navigation breadcrumb (`{ from, to }`) or a fetch
 * breadcrumb (`{ url }`) would keep a `/consent/<token>` path segment, which
 * only the path pass catches.
 */
const URLISH_KEYS = new Set([
  "url", "uri", "href", "location", "referer", "referrer", "endpoint", "to", "from", "redirect",
]);

/**
 * Key-aware deep scrub. Key awareness is the half a value-pattern pass cannot
 * do: a bare `"hunter2"` under a `client_secret` key matches no value pattern
 * at all, so only the KEY can condemn it. A sensitive key redacts its whole
 * subtree, and non-string leaves go too (a numeric one-time code or parent PIN
 * has no pattern to match).
 */
function scrubValue(value: unknown, keyName: string, depth: number, seen: WeakSet<object>): unknown {
  if (keyName && isSensitiveName(keyName, "data")) return REDACTED;
  if (typeof value === "string") {
    const isUrlish = segments(keyName).some((segment) => URLISH_KEYS.has(segment));
    return isUrlish ? scrubUrl(value) : scrubText(value);
  }
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH || seen.has(value)) return value;
  seen.add(value);

  if (Array.isArray(value)) {
    // Items inherit the parent key's context, so `tokens: [...]` is caught by
    // the guard above before we ever get here.
    return value.map((item) => scrubValue(item, keyName, depth + 1, seen));
  }
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(source)) out[key] = scrubValue(source[key], key, depth + 1, seen);
  return out;
}

/** Header names always dropped outright rather than scrubbed. */
const DROP_HEADERS = new Set(["cookie", "set-cookie", "authorization", "proxy-authorization"]);

function scrub(event: ErrorEvent): ErrorEvent {
  const seen = new WeakSet<object>();

  if (typeof event.message === "string") event.message = scrubText(event.message);
  if (event.logentry && typeof event.logentry.message === "string") {
    event.logentry.message = scrubText(event.logentry.message);
  }
  for (const exception of event.exception?.values ?? []) {
    if (typeof exception.value === "string") exception.value = scrubText(exception.value);
  }
  if (typeof event.transaction === "string") event.transaction = scrubUrl(event.transaction);

  // Never ship the account identity or the network origin.
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
    event.user = scrubValue(event.user, "", 0, seen) as typeof event.user;
  }

  // Request context: keep a scrubbed URL for triage, drop the credential parts.
  if (event.request) {
    const request = event.request;
    if (typeof request.url === "string") request.url = scrubUrl(request.url);

    if (typeof request.query_string === "string") {
      request.query_string = scrubText(scrubQueryPairs(request.query_string));
    } else if (Array.isArray(request.query_string)) {
      request.query_string = request.query_string.map((pair) =>
        Array.isArray(pair) && pair.length === 2 && isSensitiveName(String(pair[0]), "param")
          ? ([pair[0], REDACTED] as [string, string])
          : pair,
      );
    } else if (request.query_string && typeof request.query_string === "object") {
      request.query_string = scrubValue(request.query_string, "", 0, seen) as typeof request.query_string;
    }

    delete request.cookies;

    if (request.headers && typeof request.headers === "object") {
      const headers = request.headers as Record<string, unknown>;
      for (const name of Object.keys(headers)) {
        if (DROP_HEADERS.has(name.toLowerCase()) || isSensitiveName(name, "param")) delete headers[name];
        else if (typeof headers[name] === "string") headers[name] = scrubText(headers[name] as string);
      }
    }

    if (request.data !== undefined) request.data = scrubValue(request.data, "", 0, seen);
  }

  if (event.extra) event.extra = scrubValue(event.extra, "", 0, seen) as typeof event.extra;
  if (event.tags) event.tags = scrubValue(event.tags, "", 0, seen) as typeof event.tags;
  if (event.breadcrumbs) {
    event.breadcrumbs = scrubValue(event.breadcrumbs, "", 0, seen) as typeof event.breadcrumbs;
  }

  if (event.contexts) {
    const source = event.contexts as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      // `contexts.trace` is Sentry's own trace/span plumbing (trace_id,
      // span_id, parent_span_id). It carries no user data and scrubbing it
      // breaks event grouping, so it is exempt by design.
      out[key] = key === "trace" ? source[key] : scrubValue(source[key], key, 1, seen);
    }
    event.contexts = out as typeof event.contexts;
  }

  return event;
}

/**
 * `beforeSend` hook. Wrapped so a scrubber bug can never ship an unscrubbed
 * event: on an unexpected throw we degrade to an identifier-only report rather
 * than either losing the signal entirely or leaking the payload.
 */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  try {
    return scrub(event);
  } catch {
    return {
      event_id: event.event_id,
      timestamp: event.timestamp,
      platform: event.platform,
      level: event.level,
      message: "[sentry-scrub failed; payload withheld]",
    } as ErrorEvent;
  }
}

/** Exported for the test suite only. */
export const __testables = { isSensitiveName, scrubText, scrubQueryPairs, scrubUrl, segments };
