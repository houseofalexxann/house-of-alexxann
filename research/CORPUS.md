# The foundational research corpus — charter & roster

Standing policy, set by Alexandria 2026-07-14. This document governs how ALL
source material is treated, forever. It extends `README.md` (copyright
policy) and `workflows/INGEST.md` (the intake procedure).

## The charter

House of Alexxann is built on a growing body of historical, scholarly,
philosophical, scientific, and interdisciplinary research. The purpose is
**not to copy these works** — it is to learn from them, synthesize them
responsibly, preserve attribution, identify disagreements, and develop an
original knowledge system that is transparent about its sources.

Standing rules:

1. **Materials are analyzed, never reproduced.** Books, papers, lectures,
   interviews, and notes are research inputs, not content.
2. **Attribution always survives.** Every concept remains traceable to its
   sources; every interpretation carries its evidence level; every AI
   response must be able to say where an idea comes from.
3. **The eight categories never merge.** Historical doctrine · scholarly
   interpretation · scientific evidence · empirical observation ·
   psychological/philosophical theory · Alexandria's synthesis · teaching
   simplification · speculative ideas. (Enforced in data: the knowledge
   layer's `EpistemicStatus` enum — `doctrine`, `scholarship`, `evidence`,
   `theory`, `observation`, `synthesis`, `simplification`, `experimental`.)
4. **Disagreements are preserved, not resolved away.** When authors
   conflict, both claims enter the graph with a `contrasts` cross-reference.
   Valens disagreeing with Ptolemy is content.
5. **The library is cumulative.** New sources expand, contradict, or
   strengthen the existing body — they never silently replace it. No
   existing content is rewritten on the authority of a single new source;
   the intake report shows the tension and Alexandria decides.
6. **The goal is trustworthiness, not size.**

## Intake: the 12 steps (run for every new source)

1. Add to the Source Library (`sources/<slug>/source.yaml` + Source row).
2. Catalog the author(s) (Author rows; `authors/` note if substantial).
3. Catalog the publication (year, publisher, language, rights).
4. Record edition and translator when applicable (Edition row — citations
   point at editions).
5. Identify the historical tradition / discipline (`Tradition` enum).
6. Identify the primary subjects.
7. Identify major concepts (link or create Concept nodes).
8. Identify terminology (Term rows; note translation/transliteration
   choices).
9. Identify relationships to existing concepts (`CrossRef`: derives_from,
   refines, translates_to, see_also).
10. Identify disagreements with existing authors (`CrossRef: contrasts` +
    opposing Claims, both cited).
11. Recommend placement within the knowledge graph.
12. Recommend influence scope — which of these it should inform:
    educational content · AI responses · website pages · personalized
    interpretations · glossary entries · product features. (Recorded in
    `source.yaml → influence:`; nothing flows to a surface it wasn't
    approved for.)

## The roster

Named foundational corpus. Status: ○ awaiting acquisition · ◐ cataloged ·
● noted & linked. All ○ today — this list is the acquisition checklist, and
new names append rather than replace.

### Traditional astrology — primary sources (Hellenistic → Renaissance)
| Author | Era | Note |
|---|---|---|
| Ptolemy ○ | 2nd c. CE | *Tetrabiblos* — also astronomy bridge |
| Vettius Valens ○ | 2nd c. CE | *Anthology* |
| Dorotheus of Sidon ○ | 1st c. CE | *Carmen Astrologicum* |
| Firmicus Maternus ○ | 4th c. CE | *Mathesis* |
| Paulus Alexandrinus ○ | 4th c. CE | *Introduction* |
| Rhetorius ○ | 6th–7th c. CE | Compendium |
| Masha'allah ○ | 8th c. CE | Perso-Arabic transmission |
| Sahl ibn Bishr ○ | 9th c. CE | Judgments, questions |
| Abu Ma'shar ○ | 9th c. CE | *Great Introduction* |
| Guido Bonatti ○ | 13th c. | *Book of Astronomy* |
| William Lilly ○ | 17th c. | *Christian Astrology* |
| Jean-Baptiste Morin ○ | 17th c. | *Astrologia Gallica* |

### Traditional astrology — modern scholars, translators & practitioners
Chris Brennan ○ · Demetra George ○ · Helena Avelar ○ · Luís Ribeiro ○ ·
Benjamin Dykes ○ (translator of much of the medieval corpus) ·
Robert Schmidt ○ & Project Hindsight ○ (Hellenistic retrieval) ·
Robert Hand ○ · James Holden ○ (history) · Deborah Houlding ○ (houses) ·
Dorian Greenbaum ○ (sect, daimon) · Levente László ○ (Greek sources) ·
Joseph Crane ○.

### Astronomy & history of science
History of astronomy ○ · celestial mechanics ○ · planetary motion ○ ·
precession ○ · coordinate systems ○ · astronomical software ○ (the engine's
own Swiss Ephemeris documentation belongs here).

### Philosophy
Stoicism ○ · Hermeticism ○ · Neoplatonism ○ · Aristotle ○ · Plato ○ ·
Jung-as-philosopher ○ · existentialism ○ · phenomenology ○.

### Psychology
Carl Jung ○ · James Hillman ○ · Internal Family Systems ○ · attachment
theory ○ · trauma research ○ · narrative psychology ○ · positive
psychology ○ · meaning-making ○. *(Claims from here are `evidence` when
replicated, `theory` when framework — never dressed as doctrine.)*

### Human Design
Original Ra Uru Hu materials ○ · subsequent analyses ○. *(Modern synthesis,
1987 — framed as such everywhere, per the voice standards.)*

### Symbolism & myth
Joseph Campbell ○ · Mircea Eliade ○ · mythology ○ · comparative religion ○ ·
semiotics ○ · archetypal studies ○.

### Contemporary astrology & public education *(craft shelf — see below)*
Studied for **how astrology is communicated, taught, designed, and
experienced** in contemporary culture — informing educational design, UX,
writing style, accessibility, inclusive language, community building,
business models, product strategy, and ethical practice. Their
interpretations remain clearly distinguished from historical primary
sources unless they explicitly cite those sources.

| Contributor | Study scope | Status |
|---|---|---|
| Chani Nicholas ○ | Books, app, newsletters, podcasts, interviews, courses, talks, website, design philosophy — accessible education, trauma-informed & identity-affirming language, subscription/onboarding experience, editorial voice, ethical framing, content architecture | Craft-study rubric: `workflows/CRAFT-STUDY.md` |
| *(roster open — contributors append here)* | | |

**Craft-shelf rules:** never imitate the voice or reproduce the material.
Analyze the mechanics — why the writing resonates, how lessons are
structured, how complexity is made accessible, how uncertainty is
discussed, how social context is incorporated, how trust and brand
consistency are built. The deliverable of every craft study is
**strengths · limitations · openings for the House's own distinct voice** —
never a template to copy. Mark these sources `study-focus: craft` in
`source.yaml`; their `influence:` scope points at design/voice/product
surfaces, not at astrological doctrine.

### Design
Liberatory Design ○ · Human-Centered Design ○ · Inclusive Design ○ ·
accessibility ○.

### Research methods
Qualitative research ○ · mixed methods ○ · historical methods ○ · source
criticism ○ · information science ○ · knowledge management ○ · digital
humanities ○.

## Copyright posture (unchanged, restated)

Modern works (Brennan, George, Dykes translations, et al.) are in copyright:
notes, structured claims, and short cited excerpts only. Ancient texts are
public domain in old editions; the modern critical translations you'll
actually read are not. `rights:` in every `source.yaml` controls what may
surface publicly. See `README.md`.
