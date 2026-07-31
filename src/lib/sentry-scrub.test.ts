import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";

import { __testables, scrubEvent } from "./sentry-scrub";

/*
 * Fixtures are ASSEMBLED AT RUNTIME, never written as string literals. Nothing
 * below is a real credential, but a literal that LOOKS like one trips GitHub
 * push protection and bounces the push. `j()` keeps every secret-shaped fixture
 * out of the file as a contiguous string.
 */
const j = (...parts: string[]): string => parts.join("");

const CONSENT_TOKEN = j("wl", "cn", "-", "a1b2c3d4e5f6", "a7b8c9d0e1f2");
const BARE_VALUE = j("hunter", "2", "plain"); // matches NO value pattern: only its key condemns it
const PARENT_EMAIL = j("parent", ".", "one", "@", "example", ".com");
const DB_PASSWORD = j("np", "g_", "Qx7", "Zt", "R4", "vL");
const JWT = [j("ey", "JhbGciOiJIUzI1NiJ9"), j("eyJzdWIiOiIx", "MjM0NTY3ODkwIn0"), j("SflKxwRJSMe", "KKF2QT4fwpMeJf36P")].join(".");
const STRIPE_KEY = ["sk", "test", j("AbCdEf", "1234567890", "GhIjKl")].join("_");
const MAILGUN_KEY = j("key", "-", "a1b2c3d4".repeat(4));
const TRACE_ID = "0af7651916cd43dd8448eb211c80319c";
const SPAN_ID = "b7ad6b7169203331";

function makeEvent(overrides: Partial<ErrorEvent> = {}): ErrorEvent {
  return { event_id: "abc123", timestamp: 1, platform: "javascript", ...overrides } as ErrorEvent;
}

/** Everything is asserted against the serialised event, per the leak model. */
function scrubbedJson(event: ErrorEvent): string {
  return JSON.stringify(scrubEvent(event));
}

describe("scrubEvent: credentials never leave", () => {
  it("scrubs query_string, which is a SEPARATE field from url", () => {
    // A bare query string is not a parseable URL, so a URL-only pass misses it.
    const json = scrubbedJson(
      makeEvent({ request: { query_string: `token=${CONSENT_TOKEN}&code=${CONSENT_TOKEN}&state=idle&bookId=alice` } }),
    );
    expect(json).not.toContain(CONSENT_TOKEN);
    expect(json).toContain("token=[redacted]");
    expect(json).toContain("code=[redacted]");
    // Counter-assertion: `state` is a CSRF echo, not a credential, and the
    // resource id is the whole point of triage. Both survive.
    expect(json).toContain("state=idle");
    expect(json).toContain("bookId=alice");
  });

  it("scrubs the object and tuple-array forms of query_string too", () => {
    const asRecord = scrubbedJson(makeEvent({ request: { query_string: { token: CONSENT_TOKEN, bookId: "alice" } } }));
    expect(asRecord).not.toContain(CONSENT_TOKEN);
    expect(asRecord).toContain("alice");

    const asPairs = scrubbedJson(
      makeEvent({ request: { query_string: [["access_token", CONSENT_TOKEN], ["bookId", "alice"]] } }),
    );
    expect(asPairs).not.toContain(CONSENT_TOKEN);
    expect(asPairs).toContain("alice");
  });

  it("matches labels across underscores, where \\b would fail", () => {
    // `\b(secret)\b` never matches the SECRET in an env-var-shaped name because
    // `_` is a word character. These are the real names this repo uses.
    for (const label of [
      ["BETTER", "AUTH", "SECRET"].join("_"),
      ["FLASHLEARN", "API", "KEY"].join("_"),
      ["OUTBOX", "INGEST", "SECRET"].join("_"),
      ["CLOUDINARY", "API", "SECRET"].join("_"),
      ["MAILGUN", "API", "KEY"].join("_"),
    ]) {
      const json = scrubbedJson(
        makeEvent({ exception: { values: [{ type: "Error", value: `Missing ${label}=${BARE_VALUE} in env` }] } }),
      );
      expect(json, label).not.toContain(BARE_VALUE);
      // The label itself is kept: knowing WHICH var is missing is the signal.
      expect(json, label).toContain(label);
    }
    expect(__testables.isSensitiveName(["STRIPE", "WEBHOOK", "SECRET"].join("_"), "data")).toBe(true);
    expect(__testables.segments(["FLASHLEARN", "API", "KEY"].join("_"))).toEqual(["flashlearn", "api", "key"]);
    expect(__testables.isSensitiveName("clientSecret", "data")).toBe(true);
  });

  it("deep-scrubs KEY-AWARE, catching bare values no pattern could match", () => {
    const json = scrubbedJson(
      makeEvent({
        extra: {
          client_secret: BARE_VALUE,
          consentToken: BARE_VALUE,
          "x-api-key": BARE_VALUE,
          nested: { deeper: { parent_email: PARENT_EMAIL, sessionToken: BARE_VALUE } },
          tokens: [BARE_VALUE, BARE_VALUE],
          pin: 4821,
          bookId: "alice-in-wonderland",
        },
      }),
    );
    expect(json).not.toContain(BARE_VALUE);
    expect(json).not.toContain(PARENT_EMAIL);
    expect(json).not.toContain("4821");
    expect(json).toContain("alice-in-wonderland");
  });

  it("scrubs breadcrumbs, extra, tags and non-trace contexts", () => {
    const json = scrubbedJson(
      makeEvent({
        breadcrumbs: [
          {
            category: "fetch",
            message: `POST /api/flashlearn/webhook ${MAILGUN_KEY}`,
            data: { url: `/api/curriculum/alice?apiKey=${BARE_VALUE}`, status_code: 500 },
          },
          { category: "navigation", data: { from: "/library", to: `/consent/${CONSENT_TOKEN}` } },
        ],
        tags: { "router.kind": "App Router", session_token: CONSENT_TOKEN },
        contexts: {
          trace: { trace_id: TRACE_ID, span_id: SPAN_ID, op: "http.server" },
          runtime: { name: "node", api_key: BARE_VALUE },
        },
      }),
    );
    expect(json).not.toContain(MAILGUN_KEY);
    expect(json).not.toContain(BARE_VALUE);
    expect(json).not.toContain(CONSENT_TOKEN);
    // Path context beats shape: the credential segment goes, the route stays.
    expect(json).toContain("/consent/[redacted]");
    expect(json).toContain("/api/curriculum/alice");
    expect(json).toContain("500");
    expect(json).toContain("App Router");
    expect(json).toContain("node");
    // contexts.trace is exempt: these are Sentry's grouping keys, not user data.
    expect(json).toContain(TRACE_ID);
    expect(json).toContain(SPAN_ID);
  });

  it("drops account identity and credential-bearing request parts", () => {
    const username = j("parent", "-handle-", "4217");
    const json = scrubbedJson(
      makeEvent({
        user: { id: "user_123", email: PARENT_EMAIL, ip_address: "203.0.113.9", username },
        request: {
          method: "POST",
          url: `https://stories.wanderlearn.witus.online/api/curriculum/alice-in-wonderland?ref=newsletter`,
          cookies: { better_auth_session: CONSENT_TOKEN },
          headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (iPhone)",
            cookie: `better_auth_session=${CONSENT_TOKEN}`,
            authorization: `Bearer ${CONSENT_TOKEN}`,
            "x-api-key": BARE_VALUE,
            "x-hub-signature-256": BARE_VALUE,
          },
          data: { parentEmail: PARENT_EMAIL, consentToken: CONSENT_TOKEN, bookId: "alice" },
        },
      }),
    );
    expect(json).not.toContain(PARENT_EMAIL);
    expect(json).not.toContain("203.0.113.9");
    expect(json).not.toContain(username);
    expect(json).not.toContain(CONSENT_TOKEN);
    expect(json).not.toContain(BARE_VALUE);
    expect(json).not.toContain("cookie");
    // Counter-assertions: triage data survives.
    expect(json).toContain("user_123");
    expect(json).toContain("content-type");
    expect(json).toContain("Mozilla/5.0 (iPhone)");
    expect(json).toContain("alice-in-wonderland");
    expect(json).toContain("ref=newsletter");
  });

  it("scrubs vendor secrets, JWTs and connection-string passwords", () => {
    const conn = j("postgres", "://", "neondb_owner", ":", DB_PASSWORD, "@", "ep-x.us-east-2.aws.neon.tech/neondb");
    const json = scrubbedJson(
      makeEvent({
        message: `connect failed ${conn}`,
        exception: { values: [{ type: "Error", value: `auth ${JWT} billing ${STRIPE_KEY} mail ${MAILGUN_KEY}` }] },
      }),
    );
    expect(json).not.toContain(DB_PASSWORD);
    expect(json).not.toContain(JWT);
    expect(json).not.toContain(STRIPE_KEY);
    expect(json).not.toContain(MAILGUN_KEY);
    // Host and role stay: they are how you tell which database failed.
    expect(json).toContain("neondb_owner");
    expect(json).toContain("ep-x.us-east-2.aws.neon.tech");
  });

  it("redacts token path segments but never resource ids of the same shape", () => {
    const id = "alice-in-wonderland";
    expect(__testables.scrubUrl(`/verify/${CONSENT_TOKEN}?next=/library`)).toBe("/verify/[redacted]?next=/library");
    expect(__testables.scrubUrl(`/api/curriculum/${id}`)).toBe(`/api/curriculum/${id}`);
    expect(__testables.scrubUrl(`/alice/h2-hall?egg=${id}`)).toContain(id);
  });
});

describe("scrubEvent: does not over-redact", () => {
  it("keeps names that merely CONTAIN a secret word as a substring", () => {
    // Substring matching would redact every one of these. Segment matching does not.
    const preserved: Record<string, string> = {
      design: "art-deco",
      keyboard: "qwerty",
      designer: "wonderland-studio",
      encoded: "utf-8",
      monkeypatch: "no",
      state: "idle",
      standardCode: "K.RL.2.1",
      bookName: "Alice in Wonderland",
      hubName: "The Hall of Doors",
      componentName: "GazeReticle",
      keyframe: "fade-in",
      tokenizer: "none",
      publicUrl: "https://stories.wanderlearn.witus.online",
    };
    const json = scrubbedJson(makeEvent({ extra: { ...preserved } }));
    for (const [key, value] of Object.entries(preserved)) {
      expect(json, `${key} must survive`).toContain(value);
    }
    expect(json).not.toContain("[redacted]");
  });

  it("treats bare key/code/hash as sensitive only in param position", () => {
    // In a query string or header, `key=` is an api key. In a payload, `code`
    // is an Indiana standard code and `key` is a React list key.
    expect(__testables.isSensitiveName("code", "data")).toBe(false);
    expect(__testables.isSensitiveName("key", "data")).toBe(false);
    expect(__testables.isSensitiveName("hash", "data")).toBe(false);
    expect(__testables.isSensitiveName("state", "param")).toBe(false);
    expect(__testables.isSensitiveName("code", "param")).toBe(true);
    expect(__testables.isSensitiveName("key", "param")).toBe(true);
  });

  it("keeps plain prose and stack frames intact", () => {
    const message = "Cannot read properties of undefined (reading 'sceneEl') at Reticle.tick";
    expect(__testables.scrubText(message)).toBe(message);
  });
});

describe("sentry-scrub: platform safety", () => {
  it("contains NO regex lookbehind, which is a SyntaxError on old iOS Safari", () => {
    // This module ships in a client chunk via instrumentation-client.ts. A
    // lookbehind here breaks that chunk for every visitor, DSN or no DSN.
    const source = readFileSync(new URL("./sentry-scrub.ts", import.meta.url), "utf8");
    expect(source.includes("(?<=")).toBe(false);
    expect(source.includes("(?<!")).toBe(false);
  });

  it("never returns null, and withholds the payload if it throws", () => {
    const event = makeEvent({ message: "boom" });
    expect(scrubEvent(event)).not.toBeNull();

    const hostile = {
      event_id: "def456",
      message: "hostile",
      get extra(): never {
        throw new Error("getter blew up");
      },
    } as unknown as ErrorEvent;
    const out = scrubEvent(hostile);
    expect(out.event_id).toBe("def456");
    expect(out.message).toBe("[sentry-scrub failed; payload withheld]");
  });
});

describe("error monitoring is inert without a DSN", () => {
  it("does not initialise a client when SENTRY_DSN is unset", async () => {
    vi.stubEnv("SENTRY_DSN", undefined);
    const Sentry = await import("@sentry/nextjs");
    await import("../../sentry.server.config");
    expect(Sentry.getClient()).toBeUndefined();
    vi.unstubAllEnvs();
  });
});
