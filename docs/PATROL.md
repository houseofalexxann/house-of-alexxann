# Weekly security and upkeep patrol

A standing checklist for both sites: House of Alexxann (this repo) and The
Alexandria Method (`~/alexandria-method`). It is written so it can be handed
to Claude Code as a single instruction, or walked by hand.

## How to run it

Open Claude Code in this folder and say:

> Run the weekly patrol in docs/PATROL.md.

To have it run by itself every week, open the Routines panel in the Claude
desktop app (or run `/schedule` in a session) and create a weekly routine
whose prompt is the line above. Scheduling was left for you to switch on,
since a routine that runs unattended is yours to approve.

## Ground rules for whoever runs it

- Never read, print or type a secret. Environment files are off limits;
  variable names are fine, values are not.
- Never merge a pull request, force push, or rewrite history. Report what is
  ready and leave the click to Alexandria.
- Never use `npm audit fix --force` or an install that omits development
  dependencies. Both have broken the build before.
- Major version bumps of next, prisma, sweph, stripe, typescript, eslint,
  vitest and @supabase are done by hand, one at a time, with a build.
- `npm ci` in a fresh copy of this repo needs a `DATABASE_URL` in the
  environment for the Prisma step; a placeholder address is enough.
- In `~/alexandria-method`, stage only the files the patrol changed. Leave
  `CLAUDE.md`, `ai-operating-system/` and `Claude outputs/` alone.
- Copy on either site is not changed by the patrol.

## The checks

1. **Both sites answer.** `https://houseofalexxann.com` and
   `https://alexandria-method.vercel.app` return 200. On the Alexandria
   Method, `/api/health` reports `supabase: ok`, `service_role: configured`
   and `rate_limiter: shared`.
2. **The engine is on real data.** A chart for 1990-06-15 14:30 in New York
   gives a Sun longitude of 84.38822558742277. Any other number means the
   Swiss Ephemeris files did not ship and the fallback is in use.
3. **Dependencies.** In each repo: `npm audit --omit=dev` shows zero
   production findings. List open Dependabot pull requests; for each, check
   it out locally, run the typecheck, tests and a production build, and
   report which are safe to merge.
4. **GitHub alerts.** Open Dependabot alerts on both repos, split into
   production and development. Anything in production is fixed that day.
5. **Security headers.** The home page of each site still sends
   Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options,
   Referrer-Policy, Permissions-Policy and a Content-Security-Policy.
6. **The doors that must stay shut.**
   - House of Alexxann: `/api/cron/reminders` without its secret is 401.
     Signed out, `/api/sky-week` returns one day and `/api/chart` returns no
     dignities or lots. A chart request with asteroids, signed out, is 403.
     A sign-in posted with `Origin: https://example.com` is 403, and one
     posted as plain text is 415.
   - Alexandria Method: `/auth/callback?next=/%5Cexample.com` redirects to
     the site's own `/admin`, never to another site. Every `/api/cron/*`
     route without the Authorization header is 401, and a `?key=` in the
     address is refused.
7. **Errors.** Read the last week of runtime errors for both Vercel
   projects and report anything new.
8. **Secrets in the repo.** `git ls-files` shows no env file and no
   `.claude/settings.local.json` in either repo.

## What the report looks like

Three short lists: what was checked and is fine, what was fixed (with the
commit), and what is waiting on Alexandria.
