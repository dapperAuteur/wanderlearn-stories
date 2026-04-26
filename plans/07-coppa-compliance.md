# 07 — COPPA Compliance

> **Disclaimer.** This plan describes the engineering and operational
> design intended to comply with the US Children's Online Privacy
> Protection Act (COPPA, 15 U.S.C. §§ 6501–6505 and the FTC's
> implementing rule, 16 CFR Part 312). It is not a substitute for
> review by qualified legal counsel. Before public launch, this design
> must be reviewed by an attorney with COPPA experience and updated as
> they direct.

## Threshold question

Wanderlearn Stories is **directed to children under 13** (target age
4–7). Therefore COPPA applies regardless of how we frame our terms of
service. There is no anonymous-collection workaround.

That means: before we collect *any* personal information from a child,
we must obtain **verifiable parental consent (VPC)**.

## Data minimization (the cheapest compliance posture)

The fastest way to be COPPA-compliant is to collect almost nothing. That
is the design.

| Surface                | What we collect                                           |
|------------------------|-----------------------------------------------------------|
| Anonymous visit        | Nothing personally identifying. No analytics tracking the visitor across sessions. No fingerprinting. |
| Local progress         | Stored in IndexedDB on-device only. Not transmitted.      |
| Logged-in (post-VPC)   | Parent's email + name; child's first name only + age band ("4-5", "6-7"); progress events keyed to the child's ID. |
| Never collected        | Child's last name, full birthdate, photo, voice, location (precise or coarse), school, contacts, social handles, behavioral ad identifiers. |

No third-party advertising SDKs. No Google Analytics, no Meta Pixel, no
behavioral ad networks. Period. Ad-supported is incompatible with this
design.

## Verifiable parental consent flow

Three options under the FTC rule are realistic for us at MVP:

1. **Email-plus** (allowed because we don't disclose personal info to
   third parties for advertising). Parent enters their email; we send
   them a confirmation link with a secondary identity prompt and require
   click-confirmation. Cheap, FTC-accepted for non-disclosure scenarios.
2. **Government-ID match** via a third-party verifier (e.g., PRIVO,
   Veratad). More robust, costs per verification. Hold for post-MVP.
3. **Credit-card transaction.** If we go paid: a paid-account creation
   (even $0.50 verification charge, refunded) is FTC-approved VPC. Use
   if the pricing model in plan 00 commits to paid.

**MVP picks option 1 (email-plus)** because we are not disclosing
personal info to third parties for advertising and are not in a higher-
risk category. Document the reasoning in the audit log.

### Flow

1. Child / unauthenticated user lands on `stories.wanderlearn.witus.online`.
2. Can play the **demo experience** (Hub 1 only, no telemetry) without
   any account.
3. To save progress, unlock Hub 2, or sync across devices: hit "Parent
   sign-up" — explicit interstitial that says *parents only, please hand
   the device to a parent*.
4. Parent enters their email + name. Better Auth sends a magic link.
5. Magic link → consent screen showing:
   - What data will be collected from the child.
   - How long it's retained.
   - The parent's COPPA rights (review, delete, refuse further).
   - Affirmative checkbox + click "I consent."
6. Now we issue a parent account. Parent then creates a *child profile*
   — child first name + age band only.
7. Telemetry begins, scoped to that child profile.

### What blocks before VPC

- No account creation for under-13 without a parent in the loop.
- No persistent server-side identifiers tied to the child.
- No FlashLearn-AI sync (per plan 08, FlashLearn-AI receives scoped,
  consented child data only after VPC).

## Parent rights surface

Parent dashboard (`/dashboard`) must include:

- **Review:** see all data we have on the child.
- **Export:** download as JSON.
- **Delete:** one-click full deletion of the child profile and all
  associated events. Cascades to FlashLearn-AI via API.
- **Refuse further:** disable telemetry for the child while keeping the
  account active (offline / local-only mode).
- **Contact:** privacy@witus.online (set up a real, monitored mailbox).

These are required by COPPA, not optional UX.

## Retention

| Data class                    | Retention                                       |
|-------------------------------|-------------------------------------------------|
| Child progress events         | 18 months from last activity, then auto-deleted |
| Aggregated, de-identified counts | Indefinite (not personal information)        |
| Parent account                | Until parent deletes                            |
| Audit logs of consent + deletion | 7 years (FTC enforcement window)             |

Auto-deletion is a scheduled job (Vercel cron once daily) that purges
event rows older than 18 months from `child_id`s where no activity has
occurred in that window. Code review the deletion query annually.

## Third parties + DPAs

Every vendor in the data path needs a Data Processing Agreement and
must be listed publicly in the privacy policy. Current list:

| Vendor          | Purpose                          | DPA required |
|-----------------|----------------------------------|--------------|
| Vercel          | Hosting, logs                    | Yes          |
| Neon            | Postgres                         | Yes          |
| Cloudinary      | Audio + asset CDN                | Yes — and confirm no audio fingerprinting / behavioral profiling on their side |
| FlashLearn-AI   | Spaced rep                       | Internal — but treat as if external; sign explicit DPA between WitUS entities |
| Mailgun         | Parent emails (consent, account) | Yes          |
| Better Auth     | Self-hosted; no DPA needed       | N/A          |

If a vendor cannot sign or refuses to commit to no-behavioral-profiling
of child data, replace them.

## Privacy policy + terms

Two documents required at launch:

- **Privacy policy** — child-data-specific section that meets §312.4
  notice requirements (categories collected, how used, parental rights,
  contact). Plain-English summary at the top, full legal below.
- **Terms** — including a clause that the service is intended for
  children but use is permitted only by a parent / legal guardian on the
  child's behalf.

Drafts go in `plans/_artifacts/` and are reviewed by counsel before
launch. Sub-13 users may not click-through accept Terms; the parent
account holder accepts on the child's behalf.

## Engineering checklist

- [ ] Better Auth configured with VPC gate; no child profile creation
      possible without parent verification step.
- [ ] All `/api/events` and `/api/progress` routes reject requests where
      the authenticated principal is not a parent who has VPC for the
      target child profile.
- [ ] IndexedDB outbox flushes only after VPC; before VPC, events stay
      on-device only.
- [ ] Deletion endpoint cascades to FlashLearn-AI via API, with a
      verification pass that returns 404 on subsequent reads.
- [ ] Cron job for retention purge implemented + tested with synthetic
      data.
- [ ] Privacy policy reachable from every page footer + parent dashboard.
- [ ] `robots.txt` and metadata indicate the site is for parents — but
      do not rely on this; assume children may visit directly.
- [ ] No third-party scripts on any page that handles child data.
      `Content-Security-Policy` enforces this.
- [ ] Audit log table records every VPC grant + deletion request with
      timestamps. Immutable append-only via Postgres trigger.

## What does *not* belong in this plan

- Implementation details of the Better Auth integration. That's plan 02.
- Marketing copy. That's plan 00.
- The actual privacy policy text. That's a legal artifact; counsel
  drafts it and we file it under `plans/_artifacts/` once approved.
