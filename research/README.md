# The House research library

Working area for sources, reading notes, and excerpts — the scholarly spine
behind the encyclopedia, the courses, and (later) the AI guide. Structure and
workflow come from the architecture review (§10, approved 2026-07-12).

## Copyright policy — in writing, non-negotiable

- **In-copyright works** (Brennan, George, Avelar & Ribeiro, modern
  translations of classical texts): store *your own notes*, *structured
  claims*, and *short excerpts with exact locators* — never chapters, never
  full text. Notes and claims may be published; excerpts only within fair-use
  length and always attributed.
- **Public-domain works** (old editions, ancient-language texts): full text
  may be stored, but excerpts + notes are still the useful unit.
- Every source declares its `rights:` in `source.yaml`, and that field
  controls what may ever surface publicly.

## Layout

```
research/
├── sources/<source-slug>/    # one folder per work
│   ├── source.yaml           # metadata (see _template)
│   ├── notes/                # your reading notes, one file per chapter/theme
│   └── excerpts/             # short quotes, one file each, with locators
├── authors/                  # biographical & tradition notes
├── workflows/                # INGEST.md · QA-CHECKLIST.md
└── _template/                # copy me to start a new source
```

## The unit of knowledge

A **claim**: one idea, in your own words, tagged with concepts and an
epistemic status —

| Status | Means |
|---|---|
| `doctrine` | what a historical source states |
| `scholarship` | what modern scholars conclude |
| `synthesis` | Alexandria's own view |
| `simplification` | teaching shorthand |
| `experimental` | ideas being tested |

Claims graduate from notes here into the knowledge database (and from there
to the public encyclopedia) only after the QA checklist passes.
