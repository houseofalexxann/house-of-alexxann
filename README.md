# ✦ House of Alexxann

Astrology platform — Phase 1 MVP. Western & Vedic natal charts with professional-grade precision (Swiss Ephemeris), a free Chart Studio, a services site, a timezone-aware booking scheduler with flexible payments, and a practitioner back office. Bright, light, Venus-in-Libra: pink, mother-of-pearl, pastels.

## Layout

| Path | What it is |
|---|---|
| `packages/engine` | **@hoa/engine** — the isolated calculation core (Swiss Ephemeris). 103-test accuracy gate. |
| `apps/web` | Next.js 16 app — site, Chart Studio, booking, admin, PWA. |
| `docs/PRD.md` | The frozen product spec this build implements. |
| `docs/BUILDLOG.md` | Decisions & deviations, in order. |
| `scripts/` | Dev launchers (`dev-web.sh`, `dev-db.mjs`). |

## Running locally

Node 22 lives in `~/.local/node/bin` (added to your shell profile). Because Turbopack can't handle the space in this folder's name, everything runs through the auto-maintained symlink `~/hoa-repo`.

```bash
# 1. Database (real PostgreSQL, no Docker — data persists in .pgdata/)
node scripts/dev-db.mjs &

# 2. Web app → http://localhost:3000
./scripts/dev-web.sh
```

First-time setup (already done on this machine): `npm install`, `npx prisma migrate dev` + `node prisma/seed.mjs` inside `apps/web`.

- **Admin**: http://localhost:3000/admin — credentials in `apps/web/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). **Change before launch.**
- **Emails** are written to `var/outbox/` until `RESEND_API_KEY` is set.
- **Payments** run in a mock checkout until `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are set; then real Stripe Checkout takes over (card, Klarna Pay-in-4, Afterpay, Affirm, Cash App Pay, PayPal — enable them in the Stripe dashboard). Venmo/Cash App/Zelle/PayPal **direct pay** works today: set your real handles in Admin → Availability & settings.
- **Engine tests**: `npm run engine:test` (must stay green — it's the accuracy gate).

## Before public launch (from PRD §15 + build log)

1. **Swiss Ephemeris license** — AGPL vs. paid commercial (PRD's one open item).
2. Real prices, real payment handles, real Stripe/Resend keys, strong `ADMIN_PASSWORD`/`SESSION_SECRET`.
3. Managed Postgres (`DATABASE_URL`) + hosting; point a cron at `/api/cron/reminders` (with `CRON_SECRET`).
4. Domain (houseofalexxann.com) + privacy policy page for birth-data consent (PRD §11).
