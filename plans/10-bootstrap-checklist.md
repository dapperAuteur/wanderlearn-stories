# 10 — Bootstrap Checklist (user tasks)

Tasks for BAM, in order. Each task lists exact commands. Items in
**bold** are blocking — the next task can't start until they're done.

---

## A. Decisions before pushing anything

### A1. Confirm repo name

Local dir is `wanderlearn-stories`. Plans assume the GitHub repo name
matches.

- [ ] Final GitHub repo name (default: `wanderlearn-stories`).

### A2. Confirm Vercel project name

Plans assume Vercel project name `wanderlearn-stories`, team
`aweful1s-projects` (matches witus-online).

- [ ] OK with that, or different name?

### A3. Confirm subdomain

Plans assume `stories.wanderlearn.witus.online`. The DNS lives wherever
`wanderlearn.witus.online` is currently delegated.

- [ ] Confirm subdomain.
- [ ] Confirm where the parent DNS zone (`wanderlearn.witus.online`)
      is hosted so the CNAME goes in the right place.

---

## B. Local prerequisites

### B1. Upgrade Vercel CLI

```bash
pnpm add -g vercel@latest
vercel --version
```

The session reminder flagged your CLI as `51.6.1` → `52.0.0`. Upgrade
before bootstrap.

### B2. Confirm Node version

```bash
node --version
```

Should be `v24.x` (current LTS, the Vercel default). If not, install
Node 24 via your version manager.

### B3. Install pnpm if needed

```bash
which pnpm || npm i -g pnpm
pnpm --version
```

### B4. Confirm logged into Vercel

```bash
vercel whoami
```

If not logged in: `vercel login`.

### B5. Confirm `gh` CLI is logged in

```bash
gh auth status
```

If not: `gh auth login`.

---

## C. Repo creation + first push

Initial scaffold + plans are already on `main` locally (BAM merged
`chore/scaffold` into `main` before the remote existed). The first push
goes directly to `main`. **Future work** still follows the
branch→commit→push→stop rule.

### C1. Create the empty GitHub repo

```bash
cd /Users/bam/Code_NOiCloud/ai-builds/gemini/wanderlearn/wanderlearn-stories

gh repo create dapperAuteur/wanderlearn-stories \
  --private \
  --source=. \
  --remote=origin \
  --description="Wanderlearn Stories — 360° public-domain literary worlds for ages 4–7"
```

`--source=.` tells gh to use the current directory as the source. It
adds the remote for you. **Do not** pass `--push` — let C2 do that
explicitly.

### C2. Push main

```bash
git push -u origin main
```

This is a one-time exception to the branch→commit→push→stop rule:
`main` has the initial scaffold history but no remote yet, so the first
push has nowhere else to go. Once `main` is on origin, every subsequent
change goes through a feature branch + PR.

### C3. Push any pending feature branches

If there are local branches that haven't merged into main yet (e.g.
this `chore/sync-bootstrap-checklist` branch), push them now and open
PRs in the GitHub UI.

```bash
git push -u origin <branch-name>
```

Per the ecosystem rule, **BAM merges; the agent does not**.

---

## D. Vercel + integrations bootstrap

### D1. Run the bootstrap skill

In a Claude Code session inside the local repo:

```
/vercel:bootstrap
```

That skill will:

- Detect Next.js 16.
- Prompt to link to a Vercel project; pick `aweful1s-projects` team and
  the project name from A2.
- Provision Neon Postgres via the Vercel marketplace integration
  (preview-branched).
- Pull env vars to `.env.local`.
- Run a first dev sanity check.

### D2. Add the secrets bootstrap can't provision

These need to come from sources outside Vercel:

```bash
# Better Auth signing secret — generate with `openssl rand -base64 32`
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_SECRET preview

vercel env add BETTER_AUTH_URL production
# value: https://stories.wanderlearn.witus.online
vercel env add BETTER_AUTH_URL preview
# value: leave to per-deployment URL or use a stable preview URL

vercel env add FLASHLEARN_API_BASE production
vercel env add FLASHLEARN_API_BASE preview
vercel env add FLASHLEARN_API_BASE development

vercel env add FLASHLEARN_API_KEY production
vercel env add FLASHLEARN_API_KEY preview

vercel env add MAILGUN_API_KEY production
vercel env add MAILGUN_API_KEY preview

vercel env add MAILGUN_DOMAIN production   # e.g. mg.witus.online
vercel env add MAILGUN_DOMAIN preview
vercel env add MAILGUN_DOMAIN development
```

After adding any env var, repull locally:

```bash
vercel env pull .env.local
```

### D3. DNS

Add a CNAME on the parent zone (`wanderlearn.witus.online`):

| Name      | Type   | Value                       |
|-----------|--------|-----------------------------|
| `stories` | CNAME  | `cname.vercel-dns.com.`     |

Then in the Vercel project: **Settings → Domains → Add** →
`stories.wanderlearn.witus.online`. Vercel will tell you what
verification record (if any) is needed.

### D4. First deploy

Push `main` (or merge anything to main) to trigger the production
deploy. Confirm:

- [ ] Build succeeds in Vercel.
- [ ] `https://stories.wanderlearn.witus.online` resolves and returns
      the placeholder home page.
- [ ] `vercel logs` shows no startup errors.

---

## E. Pre-launch (not needed before moving the chat)

Tracking only — these are launch-blockers but not move-the-chat-blockers.

- [ ] Indiana K teacher review of the six MVP eggs (plan 06).
- [ ] Privacy policy + terms drafted and reviewed by counsel (plan 07).
- [ ] Better Auth parent-gate flow implemented (plan 07).
- [ ] FlashLearn-AI integration wired (plan 08).
- [ ] Indiana K standard codes verified against current IDOE PDF.
- [ ] Two `.glb` hub assets authored and KTX2/Draco-compressed.
- [ ] Audio narration recorded.
- [ ] Pilot cohort recruited for baseline measurement (plan 08).

---

## F. Quick reference — env vars summary

| Name                              | Source                                   | Set how |
|-----------------------------------|------------------------------------------|---------|
| `DATABASE_URL`                    | Neon (via Vercel marketplace integration)| Auto-provisioned by `/vercel:bootstrap` |
| `BETTER_AUTH_SECRET`              | `openssl rand -base64 32`                | Manual via `vercel env add` |
| `BETTER_AUTH_URL`                 | Production / preview URL                 | Manual |
| `FLASHLEARN_API_BASE`             | FlashLearn-AI service base URL           | Manual |
| `FLASHLEARN_API_KEY`              | Issued from FlashLearn-AI admin          | Manual |
| `CLOUDINARY_CLOUD_NAME`           | Shared WitUS Cloudinary tenant           | Manual or copy from witus-online |
| `CLOUDINARY_API_KEY`              | Same                                     | Manual |
| `CLOUDINARY_API_SECRET`           | Same                                     | Manual |
| `MAILGUN_API_KEY`                 | Mailgun account                          | Manual |
| `MAILGUN_DOMAIN`                  | e.g. `mg.witus.online`                   | Manual |
| `NEXT_PUBLIC_PUBLIC_URL`          | Production URL                           | Manual |
| `NEXT_PUBLIC_PARENT_GATE_AGE`     | `13` (COPPA threshold)                   | Manual |
