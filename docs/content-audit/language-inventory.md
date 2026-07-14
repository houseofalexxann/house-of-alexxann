# Language inventory — House of Alexxann copy audit

Phase 1 deliverable · 2026-07-13 · codebase at commit `2ba3af4`
Nothing in this document changes the live site. Priorities: **P1** = rewrite
first, **P4** = leave alone or touch last.

## Where the words live

| Surface | File path(s) | Type | Audience | Current voice | AI-language risk | Claim risk | Evidence need | Priority |
|---|---|---|---|---|---|---|---|---|
| Homepage | `apps/web/src/app/page.tsx` | Marketing / orientation | First-time visitors | Warm, mostly concrete; a few inflated phrases ("one-stop sanctuary") | **Medium** | Low | "professional-grade precision" should name the Swiss Ephemeris | **P1 — pilot** |
| Service descriptions | `apps/web/src/lib/services.ts` | Sales | Prospective clients | Strong and specific overall | Low | **HIGH — "surgeries" in electional copy; relocation stated as fact** | Frame debated practices as practice, not fact | **P1** |
| About page | `apps/web/src/app/about/page.tsx` | Philosophy / trust | Everyone | Good bones; liberation flags + disclaimer already present | Low | Medium | **[Alexandria input needed]** — story, lineage, what a session is like in *her* words | **P2** |
| Chart interpretations (Western) | `apps/web/src/lib/interpretations/` — `signs-*.ts`, `houses-*.ts`, `aspects-*.ts` (10 files, ~1,800 lines) | Interpretive content | Chart users | **Strongest writing on the site** — specific, humane, memorable | Low (see voice-diagnosis for tics) | **Systemic: doctrine voiced as second-person certainty, zero attribution** | Framing layer, not line edits | **P2 (framing)** |
| Vedic interpretations & nakshatra content | `lib/interpretations/vedic.ts`, `lib/learn-data.ts` | Interpretive + reference | Chart users, learners | Rich, reverent | Low | Medium — deity lore & remedies stated flat; one health-adjacent line | Citation per the Adi Parashakti ethics policy; source the deity legend | **P2** |
| Human Design | `lib/hd-data.ts`, `app/human-design/` | Interpretive | HD users | Clear, useful | Low | **Medium-high — modern system (Ra Uru Hu, 1987) presented without origin framing** | One honest preamble + per-surface framing | **P2** |
| Tarot | `lib/tarot-data.ts`, `app/tarot/page.tsx` | Interpretive / reflective | Tarot users | Distinctive, humane ("Go inward on purpose, not in exile") | Low | Low — reads as reflective, which it is | Frame as reflective practice; "message from the House" voice needs **[Alexandria input]** blessing | **P3** |
| Membership & gates | `app/join/page.tsx`, `components/PremiumGate.tsx`, `app/account/page.tsx` | Sales / conversion | Free users | On-brand, concrete ($5, named features) | Low | Low | — | **P3** |
| Codex / Learn | `app/codex/page.tsx`, `lib/learn-data.ts` | Educational reference | Learners | Reference-plain | Low | Medium — historical facts (decans, bounds, ZR) uncited | Feeds directly into knowledge-layer migration (Phase B) — cite there, not inline | **P3** |
| Auth & account microcopy | `app/login`, `signup`, `forgot`, `reset`, `components/auth/` | Functional | Users | **Excellent — keep** ("The House kept your place") | None | None | — | **P4 — protect** |
| Error messages & empty states | API routes, admin ledger | Functional | Users/admin | **Excellent — keep** ("That's not the key to this house"; "No sessions today — a day for the House itself ✦") | None | None | — | **P4 — protect** |
| Email templates | `lib/email-templates.ts` | Transactional | Clients | Warm, concrete, detail-rows | Low | Low | — | **P3** |
| SEO metadata & titles | `app/layout.tsx` + per-page `metadata` | SEO | Search / previews | Concrete and honest already | Low | Low | — | **P3** |
| Booking flow | `components/book/BookingClient.tsx` | Functional / conversion | Buyers | Clear steps, honest payment language | Low | Low | — | **P4** |
| FAQ / Donate / Accessibility | `app/faq`, `app/donate`, `app/accessibility` | Support | Everyone | Serviceable | Low-medium | Low | Accessibility commitments should stay only if true | **P3** |
| i18n dictionaries (ES/FR) | `lib/i18n/dictionaries.ts` | UI chrome | ES/FR readers | Mirrors EN chrome | Low | Low | Re-translate after EN chrome settles | **P4** |
| PWA manifest | `app/manifest.ts` | Install metadata | Installers | Minimal | Low | Low | — | **P4** |

## CTA audit (spot-check, sitewide)

Existing calls to action are already largely concrete — protect this:
`Cast your chart — free` · `Book a reading` · `Details →` · `Mark paid` ·
`Set my new password` · `Become a Venusian Doll — $5` · `✦ Seed the House`.
Borderline-poetic but functional and on-brand: `Peek behind the veil` /
`Soften the veil` (state what happens visually — they stay).

## Notes

- No instances found of the worst-tier phrases: *unlock your potential, step
  into your power, embark on a journey, cosmic blueprint, sacred container,
  holistic approach, tapestry, delve, game-changing, cutting-edge* — the site
  starts from a better place than most.
- "sacred" appears 22× but almost entirely in **accurate Vedic deity
  contexts** (Agni = sacred fire; Apas = sacred waters) — correct usage, keep.
- The deepest issue is not phrase-level; it is **epistemic framing** (see
  voice-diagnosis §3).
