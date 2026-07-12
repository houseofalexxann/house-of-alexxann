# Operations runbook

## Deploys
- Push to `main` → Vercel builds and deploys automatically (2–3 min).
- Vercel **skips** builds when nothing under `apps/web` changed. To force one,
  touch `apps/web/.deploy-trigger` and commit — never push empty commits
  (they show as CANCELED and cause confusion).
- Build command runs: engine compile → env preflight → `prisma migrate deploy`
  → `next build`. Migrations therefore apply themselves on deploy.
- Env-var changes take effect only on the **next** deployment. After editing
  one in Vercel, confirm the variable row says "Updated just now", then
  redeploy (or push a trigger commit).

## Database (Neon, production)
- Connected through Vercel's Storage integration; `DATABASE_URL` is machine-
  managed (pooled). Migrations automatically use the direct host
  (`prisma.config.ts` strips `-pooler`).
- **Backups:** Neon keeps point-in-time history (restore window per plan).
  To restore: Neon console → Branches → "Restore" to a timestamp → new branch
  → update the integration to point at it. Practice this once before you
  need it.
- **Knowledge export:** once the knowledge layer holds real content, a
  nightly JSON export to the repo doubles as versioning + offsite backup
  (Phase B deliverable).

## Local development
- The repo path contains a space, which Turbopack can't handle — always work
  through the symlink `~/hoa-repo` (maintained by `scripts/dev-web.sh`).
- File watching is blind through the symlink: restart the dev server after
  edits.
- Dev database: embedded Postgres via `node scripts/dev-db.mjs` (port 5502,
  data in `.pgdata/`).
- Without Stripe/Resend keys, payments use the mock simulator (dev only —
  blocked in production) and emails write to `var/outbox/`.

## CI
- GitHub Actions (`.github/workflows/ci.yml`) runs engine accuracy tests and
  both typechecks on every push/PR. A red ✗ on main means production may have
  shipped broken — check before building on top.

## Incident quick answers
- **Site down / erroring:** Vercel → Deployments → promote the previous READY
  deployment ("Instant Rollback"), then debug at leisure.
- **Bad deploy suspected:** `get_runtime_errors` via the Vercel MCP, or
  Vercel → Observability.
- **Sessions compromised:** rotate SESSION_SECRET (see RECOVERY.md).
- **Slot double-booked:** impossible at the DB level (partial unique index);
  if a client reports it, one of the two bookings is `canceled` — check the
  ledger.
