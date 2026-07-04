# Research: Seed Prompt Content Library

## Decision: Storage format — one JSON array file per (pairing × type)

**Decision**: Store each pool as a flat JSON array of strings at
`content/prompts/<pairing>/<type>.json` (e.g.
`content/prompts/male-female/truth.json`).

**Rationale**: The constitution (v1.1.0) forbids a database — all state
must be files. A flat JSON array is the simplest structure that satisfies
FR-001–FR-003: it's trivial to read, trivial to hand-edit to add more
prompts later, and needs no schema/migration tooling. Splitting by pairing
and type into separate files (rather than one big file) keeps each file
small, makes diffs to a single pool obvious in version control, and avoids
any need to filter/index at runtime.

**Alternatives considered**:
- *Single combined JSON file with pairing/type as nested keys*: rejected —
  harder to review/diff when only one pool changes, and no benefit since
  the app always loads exactly one pool per turn.
- *CSV files*: rejected — offers no advantage over JSON for simple string
  lists and complicates escaping of punctuation/accents already present in
  the Spanish-language prompts.
- *Database table*: rejected outright — violates the constitution's no-
  database constraint.

## Decision: Selection algorithm — shuffled queue per (session, pool)

**Decision**: When a session first needs a prompt from a given pool, build
a shuffled copy of that pool's prompt list scoped to the session. Pop
prompts off the front as they're used; when the queue empties, reshuffle
the full pool again and continue.

**Rationale**: Satisfies FR-005 and the `001-truth-or-dare` edge case
("session MUST reshuffle and reuse prompts" once a pool is exhausted)
without needing global usage tracking across sessions — usage is scoped
per session, which is simpler (Simplicity & YAGNI) and matches the actual
requirement (no repeats *within a session* until exhausted).

**Alternatives considered**:
- *Purely random pick each turn (no no-repeat tracking)*: rejected — spec
  FR-005 explicitly requires no repeats until the pool is exhausted.
- *Global cross-session usage tracking (e.g., persisted "last used"
  file)*: rejected — adds file-write concurrency concerns for no required
  benefit; the spec only requires no-repeat within a single session.

## Decision: Language/runtime — TypeScript on Node.js 20 LTS, no new dependencies

**Decision**: Implement the content module in TypeScript, using only
Node's built-in `fs`/`node:test` APIs.

**Rationale**: No existing codebase or stack exists yet in this repo; this
is effectively the first implementation decision for the project. Node.js
+ TypeScript is a reasonable, widely-supported default for a small
web/mobile-backed app, and requires no new dependency for reading static
JSON files and writing unit tests, keeping with Simplicity & YAGNI. This
choice is scoped to this feature; `001-truth-or-dare` (or a later
project-wide setup step) may formalize the overall stack.

**Alternatives considered**:
- *Adding a JSON schema validation library*: rejected for now — no
  external/untrusted input is being parsed (content files are authored by
  the project itself), so validation overhead isn't justified yet (YAGNI).
- *A full test framework (Jest/Vitest)*: rejected for this small, isolated
  module — `node:test` is sufficient and adds zero dependencies.

## Resolved unknowns

All `NEEDS CLARIFICATION` markers from the Technical Context have been
resolved above; none remain.
