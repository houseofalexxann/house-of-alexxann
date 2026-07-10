# House of Alexxann — Phase 1 Build Log

Running log of decisions and deviations during the Phase 1 build (PRD v1.1, frozen 2026-07-09).

## 2026-07-09 — Environment & scaffold

- **Machine had no dev toolchain**: no Node.js, no Homebrew, no Docker, no PostgreSQL. Installed Node.js v22.23.1 (official arm64 tarball) into `~/.local/node` — no sudo required. Xcode CLT (clang/make) was already present, so native npm modules can compile.
- **Repo layout**: npm workspaces monorepo — `packages/engine` (the isolated calculation core, per PRD §7.1/§8) and `apps/web` (Next.js site + app + admin).
- **PostgreSQL without Docker**: using `embedded-postgres` (real PostgreSQL binaries downloaded per-platform, run as an unprivileged local process, data in `.pgdata/`). The Prisma schema stays standard `postgresql`, so production can point at any managed Postgres with only a `DATABASE_URL` change.
- **Swiss Ephemeris**: attempting the `sweph` native Node binding (authentic Swiss Ephemeris, AGPL — license decision remains a pre-launch to-do per PRD §15.2). Fallback if it won't build: WASM build of the same library.

## Decision log

| # | Decision | Why |
|---|---|---|
| 1 | Node 22 LTS in `~/.local`, no sudo | Machine had no runtime; keep footprint user-local |
| 2 | npm workspaces monorepo | Engine must be isolated + independently testable (PRD §8) |
| 3 | `embedded-postgres` for dev DB | No Docker/Postgres on machine; keeps real PostgreSQL semantics |
| 4 | `sweph` (Swiss Ephemeris binding) | PRD §7.1 mandates Swiss Ephemeris lineage; native binding is the authentic library |

## Deviations from PRD

(none yet)
