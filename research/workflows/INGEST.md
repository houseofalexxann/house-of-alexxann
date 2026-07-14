# Ingesting a source — the intake procedure

Every new book, paper, lecture, interview, or note-set runs the **12 steps
in CORPUS.md** (the charter is canonical). This file is the practical
walkthrough.

## Stage 1 · Catalog (steps 1–5 · ~10 minutes, before any reading)

Copy `_template/` → `sources/<slug>/`, fill `source.yaml` completely:
metadata, edition/translator, `rights:`, tradition/discipline, and the
`influence:` scope. Create the Source/Edition/Author rows in the admin.
The `rights:` and `influence:` fields are mandatory — nothing enters the
graph without them.

## Stage 2 · Read & capture (steps 6–8)

- Notes in `notes/`, one file per chapter/theme, **in your own words**, with
  frontmatter: `concepts`, `status` (one of the eight — see below), `date`.
- Short excerpts only where exact wording matters — one file each in
  `excerpts/`, named `<locator>-<slug>.md`: quote + locator + nothing else.
- New terminology gets noted with transliteration choices (consistent with
  the existing glossary).

**The eight statuses, never merged:** `doctrine` (the source states) ·
`scholarship` (scholars conclude about sources) · `evidence` (replicated
empirical findings) · `theory` (structured frameworks — psychological,
philosophical) · `observation` (patterns seen in practice) · `synthesis`
(Alexandria's own) · `simplification` (teaching shorthand) · `experimental`
(speculative, needs research).

## Stage 3 · Verify (the QA gate)

Second pass against the source: quotes verbatim, locators exact, paraphrases
fair, statuses honest (narrowest label wins). Run
`QA-CHECKLIST.md`. Mark verified excerpts (`verifiedAt`).

## Stage 4 · Link & compare (steps 9–11)

- Attach claims to Concepts; add `CrossRef`s (`derives_from`, `refines`,
  `translates_to`, `see_also`).
- **Disagreements are deliverables:** where this source conflicts with an
  author already in the graph, write BOTH claims, cite both, join them with
  `contrasts`. Never average them into one.
- Write the intake report: how this source **expands, contradicts, or
  strengthens** the existing body. No existing content is rewritten on one
  source's authority — the report shows the tension; Alexandria decides.

## Stage 5 · Publish selectively (step 12)

Only claims that pass QA flow onward, and only to the surfaces the source's
`influence:` scope approves — educational content, AI responses, website
pages, personalized interpretations, glossary, product features. Raw notes
never publish.
