// Drizzle schema for Wanderlearn Stories.
//
// Two groups of tables:
//   1. Better Auth's standard tables (user / session / account / verification)
//      consumed by the Better Auth Drizzle adapter in src/auth/auth.ts.
//   2. Wanderlearn-specific child-data tables (parents, children, consents,
//      events, audit_log) that plan 08 mandates.
//
// Compile-only at the moment: no DATABASE_URL on most environments yet,
// so drizzle-kit migrations don't run. The schema still type-checks and
// gives the route handlers and tests something concrete to import once
// the connection lights up.

import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------
// Better Auth — standard tables (do not rename; the adapter expects
// these column names).
// ---------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ---------------------------------------------------------------------
// Wanderlearn domain tables — separate from Better Auth's user record
// because plan 08 (data minimization) draws a hard line between
// "person who can sign in" (user) and "parent who has VPC'd a child"
// (parents). Most users will be both, but the distinction matters
// for COPPA audit.
// ---------------------------------------------------------------------

export const ageBandEnum = pgEnum("age_band", ["4-7", "8-12", "13-18"]);

export const consentMethodEnum = pgEnum("consent_method", [
  "email-plus",
  "credit-card",
  "id-match",
]);

/** Parent account — distinct from the Better Auth user record. */
export const parents = pgTable("parents", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Child profile. First name + age band only — plan 07 minimization rule. */
export const children = pgTable("children", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => parents.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  ageBand: ageBandEnum("age_band").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * VPC consent record. One row per (parent, child) per consent grant.
 * Revocation is a separate row with `revokedAt` populated, not an
 * update — keeps the audit trail intact for the FTC enforcement
 * window (plan 07: 7-year retention on consent records).
 */
export const consents = pgTable("consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => parents.id, { onDelete: "cascade" }),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  method: consentMethodEnum("method").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

/**
 * Child telemetry. Plan 08 §"Diagnostic events". 18-month retention
 * (plan 07) implemented as a Vercel cron in Phase 3 that deletes rows
 * older than the cutoff.
 */
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Append-only audit log. Plan 07 §"Engineering checklist" requires
 * a Postgres trigger to enforce append-only at the database level
 * (UPDATE / DELETE raise an exception). The trigger is added in a
 * post-generated migration file (drizzle-kit can't express triggers
 * in TS — see /drizzle/0001-audit-log-append-only.sql once
 * migrations start). 7-year retention.
 */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  /** parent_id of the actor, or null for system-initiated actions. */
  actorId: uuid("actor_id"),
  /** Free-form, e.g. "child:abc-123" or "consent:..." or "event:...". */
  target: text("target"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
});

export type Parent = typeof parents.$inferSelect;
export type NewParent = typeof parents.$inferInsert;
export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
export type Consent = typeof consents.$inferSelect;
export type NewConsent = typeof consents.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
