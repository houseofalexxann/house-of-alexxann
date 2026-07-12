# Ingesting a source — the five steps

1. **Catalog** (5 minutes, before any reading)
   Copy `_template/` → `sources/<slug>/`, fill `source.yaml`, and create the
   Source/Edition rows in the admin. The `rights:` field is mandatory.

2. **Read & capture**
   Notes in `notes/`, one file per chapter or theme, in your own words, with
   frontmatter (`concepts`, `status`, `date`). Short excerpts only where the
   exact wording matters — one file each in `excerpts/`, named
   `<locator>-<slug>.md` (e.g. `p268-sect-def.md`), quote + locator + nothing
   else.

3. **Verify** (the QA gate — same spirit as the engine's accuracy tests)
   Second pass against the source: quotes verbatim, locators exact,
   paraphrases fair. Mark verified excerpts (`verifiedAt` in the DB).

4. **Link**
   Turn verified notes into Claims attached to Concepts, each with its
   epistemic status and citations. Where sources disagree, add a `contrasts`
   cross-reference — disagreement between Valens and Ptolemy is encyclopedia
   *content*, not a problem to resolve.

5. **Publish selectively**
   Promote reviewed claims to public surfaces (encyclopedia/lessons). Raw
   notes never publish; they are the House's private margins.
