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

## Decision log

| # | Decision | Why |
|---|---|---|
| 1 | Node 22 LTS in `~/.local`, no sudo | Machine had no runtime; keep footprint user-local |
| 2 | npm workspaces monorepo | Engine must be isolated + independently testable (PRD §8) |
| 3 | `embedded-postgres` for dev DB | No Docker/Postgres on machine; keeps real PostgreSQL semantics |
| 4 | `sweph` (Swiss Ephemeris binding) | PRD §7.1 mandates Swiss Ephemeris lineage; native binding is the authentic library |

## Deviations from PRD

(none yet)
