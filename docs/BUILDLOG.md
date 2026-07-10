# House of Alexxann — Phase 1 Build Log

Running log of decisions and deviations during the Phase 1 build (PRD v1.1, frozen 2026-07-09).

## 2026-07-09 — Environment & scaffold

- **Machine had no dev toolchain**: no Node.js, no Homebrew, no Docker, no PostgreSQL. Installed Node.js v22.23.1 (official arm64 tarball) into `~/.local/node` — no sudo required. Xcode CLT (clang/make) was already present, so native npm modules can compile.
- **Repo layout**: npm workspaces monorepo — `packages/engine` (the isolated calculation core, per PRD §7.1/§8) and `apps/web` (Next.js site + app + admin).
- **PostgreSQL without Docker**: using `embedded-postgres` (real PostgreSQL binaries downloaded per-platform, run as an unprivileged local process, data in `.pgdata/`). The Prisma schema stays standard `postgresql`, so production can point at any managed Postgres with only a `DATABASE_URL` change.
- **Swiss Ephemeris**: attempting the `sweph` native Node binding (authentic Swiss Ephemeris, AGPL — license decision remains a pre-launch to-do per PRD §15.2). Fallback if it won't build: WASM build of the same library.

## 2026-07-09 — Engine built and verified (the gate)

- `@hoa/engine` implements Western (tropical) + Vedic (sidereal) natal calculation: planets with retrograde flags, Asc/MC, 7 switchable house systems, major aspects with configurable orbs, nakshatras + padas, Vimshottari mahadasha/antardasha, D1 + D9, time-unknown mode, ayanamsa configurable (Lahiri default).
- Bundled Swiss Ephemeris data files (sepl/semo/seas 18, coverage 1800–2400 AD) inside the package.
- **Accuracy gate passed: 103/103 tests.**
  - 6 reference charts (Einstein, Diana, Cobain, Jobs, Obama, Monroe) verified against published values fetched from astrotheme.com (AstroDatabank birth data, Swiss-Ephemeris lineage) — every planet, Asc and MC within 2 arcminutes; astro.com itself blocks automated fetches, so Astrotheme served as the published-value source, cross-checked below.
  - Independent cross-implementation check: sweph vs `astronomy-engine` (MIT, VSOP87 lineage) agree within 0.02° (typically <5 arcsec) on Sun–Pluto for all six charts — correctness evidence independent of any copied table.
  - Vedic verified against vedicastroindex.com (Obama): sidereal Moon 10°02' Taurus, Rohini pada 1, Jupiter 7.54° Capricorn, and the full published mahadasha timeline (Moon→7/1971, Mars→7/1978, Rahu→7/1996, Jupiter→7/2012, Saturn→7/2031) — engine matches to the month.
- **Convention note:** Astrotheme "bumps" a planet within ~½° of the next Placidus cusp into the next house (2 of 36 published placements). Engine keeps strict geometric placement (astro.com data-table convention); tests accept exactly that documented case.
- Vimshottari year length: 365.25 days (the common software convention); noted as configurable later if a client tradition needs 360-day years.

## 2026-07-10 — App shell + two environment gotchas

- Next.js 16 (Turbopack default) + Tailwind v4 scaffolded in `apps/web`; read the version-16 docs bundled in `node_modules/next/dist/docs` before writing code (async `params`/`cookies`, `proxy.ts` not `middleware.ts`, `manifest.ts`, hand-rolled service worker for PWA).
- **Gotcha 1:** Turbopack spawns `node` child workers for PostCSS; the user-local Node install (`~/.local/node/bin`) wasn't on the global PATH → added to `~/.zshrc`/`~/.zprofile` and the dev launcher exports it.
- **Gotcha 2:** Turbopack **panics when the project path contains a space** ("House of Alexxann") — `spawning node pooled process: No such file or directory`. Fix: all Next dev/build runs go through a space-free symlink `~/hoa-repo` → the repo folder keeps its name; `scripts/dev-web.sh` maintains the symlink automatically.
- Design system: night-indigo base (#060917…), starlight-gold accents, Cormorant Garamond headings + Inter body, CSS-only drifting starfield (respects `prefers-reduced-motion`), card/btn primitives. Verified rendering in the browser.
- Placeholder pricing on the three services ($175/90min natal, $125/60min transit, $175/90min vedic) — **Alexandria to set real prices before launch.**

## 2026-07-10 — Owner direction changes (mid-build)

Alexandria added three requirements during the build (recorded as PRD deltas):

1. **Rebrand — "Venus in Libra"**: bright & light — pink, mother-of-pearl white, pastels — replacing the PRD §10 dark night-sky direction. Implemented as new tokens (pearl/rose/lilac/ink) + full re-theme of components, chart wheel, emails. *Deviation from frozen PRD §10, at owner's explicit request.*
2. **Flexible payments**: sliding-scale tiers (community ≈70% / standard / sustainer ≈125%, rounded to $5) on every reading; pay-in-4 & installments (Klarna/Afterpay/Affirm), Cash App Pay and PayPal wallet via Stripe Checkout; **plus direct person-to-person payment (Venmo / Cash App / Zelle / PayPal.me)** — handles configurable in admin (seeded with placeholders), slot held 24h, admin marks payment received to confirm. Rationale: Venmo/Zelle expose no practitioner APIs; P2P-with-manual-confirm is the industry-standard solo-practitioner pattern.
3. **CHANI-style presentation** (from her screenshots): keys-to-your-chart hierarchy, plain-language taglines, houses/planets cheat-sheet legend. Transits remain Phase 2 — not built.

## 2026-07-10 — Booking subsystem verified end-to-end (dev)

- Real PostgreSQL via embedded-postgres (`.pgdata/`, port 5502); Prisma 7 (new `prisma.config.ts` + driver-adapter model — `url` in schema is gone in v7).
- Verified by API test: slot computation honors Tue–Sat 10–17 seeded windows, practitioner tz (America/Chicago), 12h lead, buffers; double-booking rejected; mock checkout completes → confirmation email written to `var/outbox/`; direct-pay booking sends handle instructions email; reminder engine sent the 24h reminder for a booking 20h out (in-process scheduler + `/api/cron/reminders`).
- **Stripe runs in mock mode until keys exist** — real Checkout (incl. BNPL/Cash App/PayPal availability per Stripe account settings) needs `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`; webhook handler is implemented and signature-verified.
- Turbopack gotcha #3: it serves stale CSS from `.next/dev` cache across restarts after big `globals.css` rewrites — fixed by clearing `.next`.

## 2026-07-10 — Admin, PWA, acceptance

- Admin back office: env-credential login with HMAC-signed session cookie (single practitioner; OAuth/user accounts are Phase 2 per PRD §5 — deviation from §8's "email + OAuth" is intentional scope discipline: Phase 1 has no public accounts to authenticate). Bookings dashboard (mark direct payments received → confirmation email fires), weekly availability + exceptions + scheduler settings + payment-handle editors, client-charts page that opens the Studio prefilled (`/studio?name=&date=&time=&place=`) and auto-casts.
- PWA: `manifest.ts`, hand-rolled `public/sw.js` (cache-first statics, network-first pages, offline fallback page; `/api/*` never cached to preserve determinism), icons drawn programmatically (pink four-pointed star on pearl). Verified: SW registers at scope `/`, manifest + icons serve 200, mobile 375px layout has no horizontal overflow.
- Production `next build` passes; static/SSG/dynamic route split is sane.
- Perf: chart API measured at **~14 ms** in-browser (criterion: < 2 s).
- Known pre-standard-time caveat: births before ~1890 use the IANA zone's reference-city LMT (e.g. Europe/Berlin LMT) rather than the exact birth-city LMT — can differ by a few minutes of clock time for 19th-century charts. Engine accuracy itself is unaffected (the test suite feeds exact UTC).

## 2026-07-10 — Adversarial review of the money/auth path (fixed)

Ran a multi-agent adversarial review (3 lenses × find→verify) over booking/payment/auth. Four confirmed defects, all now fixed and re-verified:

1. **Admin cookie forgery (critical)** — `secret()` silently fell back to a hardcoded key when `SESSION_SECRET` was unset, so a prod deploy missing that env var was forgeable. Fix: throw in production if `SESSION_SECRET` is absent or <16 chars; dev keeps a labeled fallback. (`admin-auth.ts`)
2. **Double-booking race** — non-atomic `isSlotFree()` check-then-create let concurrent requests both insert. Fix: partial unique index `Booking(serviceId,startUtc) WHERE status IN (pending,confirmed)` (migration `20260710120000_booking_slot_guard`) + P2002 catch → "just taken". **Verified: 6 concurrent requests for one slot → exactly 1 booked, 5 rejected.**
3. **Canceled/expired resurrection on late payment** — `finalizePaidBooking` flipped any booking to confirmed on a delayed Stripe async payment, even if canceled or if the slot was rebooked. Fix: paid-but-canceled bookings are recorded paid and left canceled (admin refunds); a booking whose slot was taken during a pending async payment is recorded paid but held pending for admin resolution — never auto-double-booked. (`bookings.ts`)
4. **DST slot drift** — slot start used elapsed-duration math (`day.plus({minutes})`), shifting every slot an hour on the two annual DST-transition days. Fix: wall-clock `day.set({hour,minute})`. **Verified: spring-forward 2027-03-14 NY window 10:00–18:00 now yields 10:00…17:30 (was 11:00…18:30).**

Engine gate re-run after all fixes: **103/103 green.** App typecheck clean.

## 2026-07-10 — Owner direction round 2 (Venus-in-Libra feel + traditional depth)

Alexandria sent a large vision expansion. Decisions captured via Q&A: access model = **free charts, paid depth**; build all four new surfaces (Transits, Accounts+dashboard+calendar, Human Design, Tarot). Sequenced in [[tasks 12–16]].

Shipped this round:
- **Authentic glyphs**: replaced emoji-rendered symbols with real typographic astrological glyphs (U+FE0E + `.astro-glyph`/Apple Symbols text-presentation) across wheel, tables, grids, panels. Verified in-browser: sign & planet glyphs now render as engraved line-art, not color-emoji tiles. (She flagged the emoji glyphs twice.)
- **Per-sign colors**: 12 distinct colors from each sign's ruler/element, applied to sign glyphs.
- **Lighter modern-zen background**: removed the purple/lilac cast; airy pearl with the faintest dawn washes.
- **Engine depth (traditional/Hellenistic)** — new `traditional.ts`: sect (day/night) + light-leader + in/out-of-sect (incl. Mercury oriental/occidental), essential dignities (domicile/exaltation/detriment/fall per Ptolemy/Abu Ma'shar), natal moon phase (centered octants + illumination), aspects to Asc/MC, and `computeSolarReturn()` (bisection to the Sun's natal longitude). **+11 tests, 114/114 green.** Solar return verified: Sun returns to natal degree within ~1′ on the correct date.
- **Surfaced in Studio**: a "deeper chart" panel — sect, drawn moon-phase disc, dignity badges (gold = strong, rose = challenged), angle aspects.

Still queued (large, multi-part): public accounts + membership paywall + dashboard + booking calendar; Transits tab; Human Design; Tarot; deep content + nakshatra deities + remedies + solar-return readings + human/liberatory voice rewrite.

## Decision log

| # | Decision | Why |
|---|---|---|
| 1 | Node 22 LTS in `~/.local`, no sudo | Machine had no runtime; keep footprint user-local |
| 2 | npm workspaces monorepo | Engine must be isolated + independently testable (PRD §8) |
| 3 | `embedded-postgres` for dev DB | No Docker/Postgres on machine; keeps real PostgreSQL semantics |
| 4 | `sweph` (Swiss Ephemeris binding) | PRD §7.1 mandates Swiss Ephemeris lineage; native binding is the authentic library |

## Deviations from PRD

(none yet)
