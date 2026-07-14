# Voice diagnosis — House of Alexxann copy audit

Phase 2 deliverable · 2026-07-13 · all examples quoted verbatim with paths.
Labels used: VERIFIED FACT · HISTORICAL DOCTRINE · SCHOLARLY INTERPRETATION ·
CONTEMPORARY PRACTICE · ALEXANDRIA METHOD · REFLECTIVE LANGUAGE · SPECULATIVE ·
SOURCE NEEDED · CLAIM TOO STRONG · HUMAN INPUT NEEDED

---

## 1 · What is already strong — and must be protected

The site's best writing is unusually good, and a mechanical "de-AI" pass
would damage it. Explicitly protect:

- **Interpretation bodies** (`lib/interpretations/`): specific, humane,
  unafraid of plainness. *"You take up room, and the room is usually glad."*
  *"The drafts folder is a graveyard of geniuses."* *"Money is your long
  apprenticeship."* These are the house voice at its best.
- **Functional microcopy**: *"That's not the key to this house."* (401 error) ·
  *"The House kept your place."* (login) · *"No sessions today — a day for the
  House itself. ✦"* (empty ledger) · *"Slow down a moment, love — try again
  shortly."* (rate limit). Almost no live product writes to users like this.
- **Honest positioning that already exists**: *"practical timing, not vague
  prediction"* (transit reading) · the About page's non-determinism
  disclaimer · the blurred-but-visible honest paywall.
- **Tarot messages** (`lib/tarot-data.ts`): *"Go inward on purpose, not in
  exile."* — REFLECTIVE LANGUAGE doing exactly its job.

## 2 · Recurring tics (the honest machine-pattern audit)

Individually fine; at volume they read as a template. Found across
`lib/interpretations/*.ts`:

1. **The aphorism formula "X is your Y / X is a form of Y"** — *"Reliability
   is your love language"*, *"Competence is a form of care"*, *"Aesthetics is
   a form of respect"*, *"Depth is your default setting"*. Memorable once,
   detectable at the twentieth repetition. → Vary or cut ~half when each
   module is next touched; do not purge the best instances.
2. **The second-paragraph template "The practice is…"** — appears in the
   majority of interpretation entries, same position, same function. It is
   also good pedagogy; the fix is rhythm variation (question, image, or
   instruction-first openings), not removal.
3. **The permission formula "You are allowed to…"** — high frequency
   (*"You are allowed to be held, not just to hold"* is excellent; a dozen
   siblings dilute it).
4. **One-bolded-clause-per-paragraph** — mechanical emphasis rhythm across
   all interpretation files.
5. **"not just X (but Y)"** — 30+ instances in interpretation copy.
6. Marketing-surface inflation (small but visible): *"one-stop sanctuary for
   self-knowledge"* (`app/page.tsx`) · *"professional-grade precision"*
   (homepage + About — defensible, but stronger when it names the thing:
   the Swiss Ephemeris).

## 3 · The systemic finding: certainty without framing

Interpretations, HD, and Vedic content speak **doctrine as second-person
fact**, with no signal of where a claim comes from or how firmly it is held:

- *"Your vitality lives at the horizon line."* (`signs-personal.ts`,
  Sagittarius Sun) — CONTEMPORARY PRACTICE voiced as biography.
- *"You generate your own questions and inspiration; your wondering has a
  consistent flavor others can feel."* (`hd-data.ts`, defined Head) — a
  1987 synthesis (Ra Uru Hu) presented without origin. SOURCE NEEDED at the
  system level, not per line.
- *"Every year the Sun comes home to the exact degree it held when you were
  born"* (`services.ts`, solar return) — VERIFIED FACT (astronomy), sitting
  beside *"where you spend your birthday matters"* — CONTEMPORARY PRACTICE,
  **debated among astrologers**, stated flat.

This is fixable with a **framing layer**, not 1,800 lines of rewrites:
a short "How to read these" note on chart/HD/tarot surfaces, one honest
origin preamble per system, and — via the Phase B knowledge layer — per-claim
epistemic labels that surface as the content migrates. The writing itself
mostly survives.

## 4 · Claims requiring action (CLAIM TOO STRONG / SOURCE NEEDED)

| Claim | Where | Label | Action |
|---|---|---|---|
| *"…launches, signings, weddings, first days, **surgeries scheduled with choice**."* | `lib/services.ts` (electional) | **CLAIM TOO STRONG — medical-adjacent** | Remove "surgeries" or reframe hard ("for medical scheduling, your clinicians decide; some clients then ask about timing within the options given"). Highest-priority single edit on the site. |
| *"Relocation advice — yes, where you spend your birthday matters"* | `lib/services.ts` (solar return) | CONTEMPORARY PRACTICE, debated | Reframe: "Many modern practitioners cast the return for where you'll be that day — we'll look at both." |
| *"the body keeps honest books and files its reports as symptoms"* | `houses-outer.ts` (Saturn 6th) | Health-adjacent metaphor | Keep the image, add the site-wide interpretive-not-diagnostic frame nearby. |
| Nakshatra deity legend & remedies stated flat | `vedic.ts`, `learn-data.ts` | HISTORICAL DOCTRINE + CONTEMPORARY PRACTICE | Cite when migrated to knowledge layer, per the Adi Parashakti ethics policy already in memory. |
| *"computed with professional-grade precision"* | homepage | VERIFIED FACT, under-specified | Name it: Swiss Ephemeris — checkable and *more* impressive. |
| Decans/bounds/ZR historical material | `codex`, `learn-data.ts` | HISTORICAL DOCTRINE | SOURCE NEEDED — resolved by Phase B/C citations, not inline edits now. |

## 5 · Alexandria-input gaps (nothing invented — these are blanks, kept blank)

- `app/about/page.tsx` — her story, lineage, teachers, how she came to the
  work. **[Alexandria input needed: personal history & practice]**
- Any future *"In my experience…"* claims — none currently exist on the site
  and none were fabricated; the lived-experience register is simply absent
  and can only come from her.
- `lib/tarot-data.ts` "message from the House" cards — written in a House
  voice; she should read and bless or edit them as hers.
  **[Alexandria input needed: approve/attribute]**
- Teaching-lineage acknowledgements (Brennan, George, Adi Parashakti, et al.)
  — the Codex "sources & lineage" list should be reviewed by her before it
  reads as *her* stated influences.

## 6 · What was NOT found

No fear-based astrology. No "you are broken/blocked" framing. No cosmic
justification of hardship. No deterministic predictions of health, death, or
relationships. No fabricated testimonials or credentials. The philosophy
holds; the work is framing and finish, not rescue.
