# Product Requirements Document — Astrology & Human Design Platform

**Brand name:** House of Alexxann
**Owner:** Alexandria Ramirez
**Author of this PRD:** Drafted with Opus for handoff to Fable 5
**Version:** 1.1 — **FROZEN for handoff** (all launch decisions locked; see Section 15)
**Date:** July 9, 2026

---

## 0. How to use this document (read first)

This PRD exists because of one lesson from the Fable 5 tutorial you captured: **Fable 5 is powerful but usage-expensive and time-limited, so you never point it at planning — you point it at execution.** You do the thinking with a cheaper planning model (Opus), hand Fable 5 a finished spec, and let it run a long autonomous build.

The workflow this document is built for:

1. **Plan with Opus (done / ongoing).** This PRD is the artifact.
2. **Carve a Phase 1 MVP** — the smallest slice that proves the hardest, most differentiating part. Do *not* hand Fable 5 the whole North Star.
3. **Hand Phase 1 to Fable 5** using a `/goal`-style long-running prompt (see Section 13). Let it execute across many commits.
4. **Review with a cheaper model** (Opus/code review) between Fable 5 runs to conserve usage.
5. **Repeat per phase.**

> **Usage rule of thumb from the transcript:** don't use Fable 5 for dynamic/deep-research workflows or planning — that burns your weekly limit fast. Use Opus for planning and review; use Fable 5 for the long build.

---

## 1. North Star vision

A single, integrated, **modern-and-mystical** platform that unites three things most people buy separately:

- **A professional astrology engine** — accurate Western *and* Vedic charts (the depth of AstroGold / Solar Fire).
- **Daily guidance and interpretation** — beautiful, personal, ongoing content (the warmth of Chani / Cosmic Insights).
- **A services business layer** — a public marketing site, a booking/scheduler, and client-facing chart tools that support Alexandria's paid readings.

It serves **two audiences at once**: Alexandria's **clients** (people who book readings) and a **public** consumer audience (people who use the app on their own). **Human Design** is part of the long-term vision as an additional chart system. The app is **free to use** and monetizes through **paid services** (readings, courses) — the app is the funnel, not the product being sold.

Platforms: **web first, mobile close behind** (see Section 8 for the technical path that gets both without doubling the build).

---

## 2. Guiding principles

- **Accuracy is the moat.** In astrology, wrong math destroys trust instantly. The engine must be verifiably correct against established tools before any content sits on top of it.
- **One engine, many surfaces.** Charts, daily content, client tools, and (later) Human Design all read from the same calculation core. Never compute the same thing two ways.
- **Free app, paid relationship.** Every public feature should make booking a reading feel like the natural next step.
- **Privacy by design.** Birth data (date, exact time, place) is sensitive personal data. Treat it that way from day one.
- **Build in phases; ship the moat first.** Resist the urge to build everything before anything works.

---

## 3. Users & personas

**P1 — The Seeker (public user).** Curious about themselves, wants their chart and daily insight without paying. Values beauty, clarity, and a sense of being *known*. Conversion goal: book a reading or join a course.

**P2 — The Client (paying).** Books readings with Alexandria. Wants easy scheduling, a saved chart, session notes/recordings, and follow-up. May want both Western and Vedic perspectives.

**P3 — Alexandria (practitioner-admin).** Needs to generate accurate charts fast, manage bookings and availability, keep client records, publish content, and eventually sell courses. This is the most feature-hungry persona and the one the MVP should quietly serve well.

---

## 4. Product pillars & modules

1. **Astrology Engine (Western + Vedic)** — the calculation core.
2. **Chart Studio** — visualize and read charts (natal, transit, and more).
3. **Daily & Personal Content** — horoscopes, transits-for-you, guidance.
4. **Services & Booking** — public site, scheduler, payments.
5. **Client Space** — accounts, saved charts, session history.
6. **Human Design** *(later phase)* — bodygraph and type/authority.
7. **Admin & Content Studio** — Alexandria's back office.

---

## 5. Phased roadmap

The North Star is the destination; these are the legs of the trip. Each phase is a discrete Fable 5 build with an Opus review in between.

| Phase | Theme | Ships |
|---|---|---|
| **Phase 0** | Foundation | Repo, auth, database, design system, ephemeris integration proven correct |
| **Phase 1 — MVP** | The moat + the funnel | Western **and** Vedic natal chart calculation + Chart Studio, a public services site, and a working booking scheduler with payments. *This is the Fable 5 pilot.* |
| **Phase 2** | Depth & retention | Transits/forecasts, daily personalized content, client accounts with saved charts, session notes |
| **Phase 3** | Expansion | Human Design module, courses/memberships, native mobile, subscription-ready billing |

**Why this Phase 1?** It contains the single hardest thing to get right (a correct dual-tradition ephemeris engine — your differentiator vs. the daily-horoscope crowd) *and* the thing that earns money on day one (bookings). Daily content and client dashboards are valuable but comparatively easy follow-ons; they don't belong in the riskiest first build.

---

## 6. Phase 1 MVP — detailed scope (the Fable 5 pilot)

**Goal:** A logged-out visitor can generate an accurate natal chart (Western or Vedic), read a clean interpretation, and book a paid reading. Alexandria can manage availability and see bookings.

**In scope:**

1. **Chart input** — name, date, exact time, and birthplace (with geocoding → latitude/longitude/timezone, including historical DST).
2. **Western natal chart** — planets, ascendant/MC, and major aspects with orbs. **Switchable house systems** (default Placidus; user can switch to Whole Sign and others).
3. **Vedic natal chart** — sidereal zodiac (**Lahiri ayanamsa** default), **switchable house systems** (default Whole Sign), planetary positions, **Vimshottari dasha** timeline, the **D1 (Rasi)** chart, **and the D9 (Navamsa) chart at launch**. (Further divisional charts deferred to Phase 2.)
4. **Chart Studio** — a rendered chart wheel + a data table, toggle between Western (tropical) and Vedic (sidereal) views.
5. **Baseline interpretations** — templated, data-driven readings for sign/house/aspect placements (authored templates, not free-text AI, so they're consistent and on-brand). AI-assisted drafting is an admin tool, not a live user feature, in Phase 1.
6. **Services site** — home, about, the three offerings (Natal reading, Transit/Forecast reading, Vedic reading), pricing, testimonials placeholder.
7. **Scheduler** — availability rules, timezone-aware booking, confirmation + reminder emails, and **payment at booking** (Stripe). This is your "free tool that replaces a paid one" (à la Cal.com), built in.
8. **Admin** — Alexandria sets availability, sees upcoming bookings, and generates a client's chart on demand.

**Explicitly out of scope for Phase 1** (documented so Fable 5 doesn't wander): transits/progressions, daily push content, Human Design, courses/memberships, native mobile apps, multi-practitioner support, subscriptions.

**Phase 1 acceptance criteria:** see Section 12.

---

## 7. Feature specifications

### 7.1 Astrology Engine (the core)

- **Ephemeris:** Use the **Swiss Ephemeris** (industry standard; the same lineage professional apps rely on). Wrap it behind a single internal service so every surface calls one API. *Note the Swiss Ephemeris license (AGPL or a paid commercial license) — flagged in Open Questions as a real decision before any public/commercial launch.*
- **Western (tropical):** planetary longitudes, retrograde flags, **switchable house systems** (default Placidus; support Whole Sign and others), Ascendant/Midheaven, aspects (conjunction, opposition, trine, square, sextile) with configurable orbs.
- **Vedic (sidereal):** apply ayanamsa (**Lahiri default**; keep ayanamsa configurable), **switchable house systems** (default Whole Sign), nakshatras for the Moon, the **Vimshottari dasha** system (mahadasha/antardasha timeline), the **D1 (Rasi)** chart, **and the D9 (Navamsa)** chart — all in Phase 1. Further vargas (D10, etc.) in Phase 2.
- **Determinism & correctness:** results must match reference tools (see verification in Section 12). Same input → identical output, every time.

### 7.2 Chart Studio

- Rendered chart wheel (SVG) with planets, signs, houses, and aspect lines.
- Data table beneath the wheel for exact degrees.
- A clear Western ⇄ Vedic toggle that recomputes and re-renders.
- Save/export a chart image and a shareable summary (drives virality + booking funnel).

### 7.3 Daily & Personal Content *(Phase 2)*

- "Today for you" — driven by real transits to the user's natal chart, not generic sun-sign horoscopes.
- Weekly/monthly forecast summaries.
- Tone follows the brand: modern, mystical, warm, specific.

### 7.4 Services & Booking

- Public marketing pages for the three offerings.
- **Session formats offered:** live video call, phone call, and in person. Each service specifies its format(s); booking captures the choice and delivers the right details (video link, phone number, or location). Recorded-only readings are *not* offered.
- Scheduler: availability windows, buffer times, timezone handling, calendar sync (Google/Outlook) in Phase 2.
- Payment collected at booking via Stripe; automated confirmation and reminder emails.
- Post-booking, the client is invited to create an account (bridges P1 → P2).

### 7.5 Client Space *(Phase 2)*

- Account with saved birth data and charts.
- Session history, notes, and (optional) recording links.
- Re-booking in one click.

### 7.6 Human Design *(Phase 3)*

- Bodygraph rendering, type/strategy/authority, profile, centers/channels/gates.
- Computed from the same birth data already collected — reuses the ephemeris core (Human Design uses planetary positions at birth and ~88 days prior).

### 7.7 Admin & Content Studio

- Availability and booking management.
- On-demand chart generation for any client.
- Content authoring for interpretations and (Phase 2) daily posts, with AI-assisted drafting kept in the back office for consistency.

---

## 8. Technical architecture (recommendation)

Chosen to (a) let Fable 5 build fast, (b) get web now and mobile without a second codebase, and (c) stay within a solo/small-team maintenance budget.

- **Web app:** **Next.js (React, TypeScript)** — one framework for site + app + admin.
- **Mobile without a rebuild:** ship the web app as an installable **PWA** first; plan a **React Native / Expo** wrapper or rebuild in Phase 3 once the product is proven. This honors "web + mobile" without doubling Phase 1 cost.
- **Astrology core:** Swiss Ephemeris behind an internal calculation service (a dedicated module/microservice so it's reusable and independently testable).
- **Database:** PostgreSQL (via a managed host).
- **Auth:** email + OAuth (Google/Apple).
- **Payments:** Stripe (supports one-time now, subscriptions later — future-proofs the monetization decision).
- **Email/reminders:** a transactional email provider (e.g., Resend/Postmark).
- **Hosting:** a managed platform (e.g., Vercel for the app + a managed Postgres).
- **Styling:** Tailwind CSS + a small component library, themed to the design system in Section 10.

> Fable 5's strengths from the transcript (long-horizon builds, e.g. a 21k-line three.js game from one PRD) map well to a Next.js codebase of this size. Keep the ephemeris service isolated so it can be tested independently and reused by every later phase.

---

## 9. Data model (sketch)

- **User** (role: seeker | client | admin), auth identity, created_at.
- **BirthProfile** — belongs to a User or a Client; name, birth datetime (UTC + original local + tz), place (lat/long/tz), notes.
- **Chart** — derived artifact linked to a BirthProfile; system (western | vedic), settings (house system, ayanamsa), computed payload, computed_at.
- **Service** — title, description, duration, price, type (natal | transit | vedic).
- **Booking** — client, service, start/end, timezone, payment status, Stripe ref, status.
- **Availability** — practitioner rules (weekly windows, buffers, exceptions).
- **ContentTemplate** *(interpretations)* — keyed by placement (sign/house/aspect), body, tone.
- **Session** *(Phase 2)* — booking, notes, recording link.

---

## 10. Design system — "Modern & Mystical"

- **Mood:** dark, celestial, elegant. Deep indigo/night-sky base, soft cosmic gradients, gold/starlight accents. Generous whitespace so it feels premium, not cluttered.
- **Type:** an elegant serif for headings (editorial, a little mystical) + a clean sans for body/UI.
- **Motion:** subtle, slow, celestial — gentle star drift, smooth chart transitions. Nothing frantic.
- **Chart aesthetic:** the chart wheel is the hero visual — make it beautiful, not just a technical diagram. This is a key differentiator vs. clinical desktop tools.
- **Accessibility:** maintain contrast on dark backgrounds; don't sacrifice legibility for mood.

---

## 11. Non-functional requirements

- **Correctness:** chart math verified against reference tools (Section 12).
- **Privacy & security:** encrypt birth data at rest; clear privacy policy; explicit consent; easy data deletion. Treat exact birth time/place as sensitive PII.
- **Performance:** a chart computes and renders in under ~2 seconds.
- **Reliability:** deterministic calculations; graceful handling of unknown birth times (offer a "time unknown" mode that suppresses house-dependent output).
- **Maintainability:** the ephemeris core is isolated, documented, and unit-tested so later phases build on it safely.

---

## 12. Success criteria & verification (Phase 1)

**Definition of done:**

1. A visitor generates a Western **and** a Vedic natal chart from birth data, and both render in Chart Studio.
2. **Accuracy check:** for at least 5 known birth data sets, planetary positions, ascendant, house cusps, and the Vedic dasha timeline **match an established reference** (e.g., AstroGold / Solar Fire / a trusted online calculator) within accepted tolerance. *This is the gate — no content ships on top of an unverified engine.*
3. A user can view baseline interpretations for their placements.
4. A user can book one of the three services, pay, and receive a confirmation + reminder email.
5. Alexandria can set availability, see bookings, and generate any client's chart.
6. The app is installable as a PWA and usable on a phone browser.

**Verification method:** build an automated test suite of reference charts with expected values; Fable 5's own code-review pass (transcript use case #4) plus an Opus review before you accept the build.

---

## 13. Fable 5 handoff — the build prompt

Once you approve this PRD, start a Fable 5 session and give it a `/goal`-style long-running prompt. Draft to adapt:

> **Goal:** Build Phase 1 of the astrology platform exactly as specified in `PRD.md` (attached). Work autonomously across as many steps as needed until all Phase 1 acceptance criteria in Section 12 pass.
>
> **Constraints:** Follow the tech architecture in Section 8 (Next.js + TypeScript, Swiss Ephemeris behind an isolated calculation service, PostgreSQL, Stripe, PWA). Do not build anything marked out-of-scope in Section 6. The astrology engine must be isolated and unit-tested against the reference charts before UI work.
>
> **Method:** Start by scaffolding the repo and the ephemeris service. Prove calculation correctness against the reference test suite (Section 12, criterion 2) *before* building Chart Studio. Then build the services site, then the scheduler + Stripe, then admin. Commit frequently with clear messages. Produce a short build log of decisions and any deviations.
>
> **When done:** Report which acceptance criteria pass, which don't, and why.

> Keep Opus for the planning/PRD refinement and for reviewing Fable 5's output between runs. Reserve Fable 5 for the build itself to protect your weekly usage.

---

## 14. Assumptions

- You have (or will get) accounts for hosting, Stripe, an email provider, and a geocoding service.
- Phase 1 is single-practitioner (just you). Multi-practitioner is a later concern.
- Baseline interpretations are template-driven and authored/approved by you, not generated live per user in Phase 1.
- "Free app" means no paywall on chart generation in Phase 1; revenue comes from bookings.

## 15. Decisions locked (July 9, 2026)

All launch-scope questions are resolved. This PRD is frozen for handoff.

1. **Brand name:** **House of Alexxann** — boutique, memorable, plays on astrological "houses." Secure a matching domain (e.g. houseofalexxann.com).
2. **Swiss Ephemeris licensing:** Build and test freely now; **make the AGPL-vs-commercial-license decision before public/commercial launch.** *(Only remaining pre-launch to-do; not a blocker to start building.)*
3. **Ayanamsa:** **Lahiri** as the default (keep configurable).
4. **House systems:** **User-switchable.** Defaults: Placidus (Western), Whole Sign (Vedic).
5. **Session formats:** **Live video call, phone call, and in person.** No recorded-only readings.
6. **Brand assets:** None yet — **Fable 5 creates a first design pass** in the modern-and-mystical direction (indigo night-sky, gold/starlight accents); refine later.
7. **Vedic Phase 1 scope:** **D1 (Rasi) + Vimshottari dasha + D9 (Navamsa) at launch.** Further divisional charts in Phase 2.

**One open item to resolve before public launch (not before building):** Swiss Ephemeris license (#2).

---

*Frozen for handoff. Hand this version to Fable 5 in Claude Code; refine future phases with Opus.*
