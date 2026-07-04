# Implementation Plan: Seed Prompt Content Library

**Branch**: `002-seed-prompt-content` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-seed-prompt-content/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Provide a seed library of Truth questions and Dare actions, split into three
gender-pairing pools (male-female, male-male, female-female), each with a
Truth sub-pool and a Dare sub-pool of at least 6 prompts. Content is stored as
plain files on the server (no database, per the constitution) and exposed to
the rest of the app through a small read/selection module that picks a prompt
from the right sub-pool without repeating one within a session until the pool
is exhausted, then reshuffles.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS

**Primary Dependencies**: None beyond the Node.js standard library for this
feature (file reads, JSON parsing); no new runtime dependency is required to
serve static seed content.

**Storage**: Files — one JSON file per (pairing × prompt type) pool, e.g.
`content/prompts/male-female/truth.json`, `.../dare.json`, etc. (6 files
total). No database, per constitution v1.1.0.

**Testing**: Node's built-in test runner (`node:test`) with `assert`, run via
`npm test`; no additional test framework dependency needed for this scope.

**Target Platform**: Linux server (content is read server-side and served to
web/mobile clients over the app's existing session API — the client-facing
transport is owned by `001-truth-or-dare` and out of scope here).

**Project Type**: Single backend module (content library + selection logic)
consumed by the `001-truth-or-dare` session/turn feature.

**Performance Goals**: Prompt selection for a turn completes in under 50ms
(simple in-memory pool lookup after a one-time file read).

**Constraints**: No database (constitution v1.1.0); content files must be
safely readable by multiple concurrent game sessions without one session's
read affecting another (files are read-only at runtime — see Data Model).

**Scale/Scope**: 3 pairings × 2 prompt types × ≥6 prompts = ≥36 seed prompts
at launch; designed so more prompts can be appended to a pool file later
without code changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Test-First**: Selection logic (no-repeat-until-exhausted, reshuffle)
  is pure and unit-testable; tests will be written before implementation. ✅ PASS
- **II. Simplicity & YAGNI**: No database, no new dependency, no
  configuration system — plain JSON files and a small in-memory selector.
  ✅ PASS
- **III. User Experience Consistency**: This feature has no direct UI; it
  supplies content consumed by `001-truth-or-dare`'s existing turn UI.
  N/A — no new UI surface introduced.
- **IV. Code Review & Quality Gates**: Standard PR/test/lint gates apply; no
  exception needed. ✅ PASS
- **V. Versioning & Breaking Changes**: Prompt file format (JSON array of
  strings) is an internal contract with `001-truth-or-dare`; if the shape
  ever changes it will be called out as a breaking change. ✅ PASS
- **Additional Constraints (no database)**: Content is stored as static JSON
  files on the server; read-only at runtime, so no write-concurrency/
  corruption risk. ✅ PASS

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-seed-prompt-content/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
content/
└── prompts/
    ├── male-female/
    │   ├── truth.json
    │   └── dare.json
    ├── male-male/
    │   ├── truth.json
    │   └── dare.json
    └── female-female/
        ├── truth.json
        └── dare.json

src/
└── content/
    ├── promptLibrary.ts   # loads pool files, exposes getPrompt(pairing, type, usedSet)
    └── promptLibrary.test.ts

tests/
└── unit/
    └── promptLibrary.test.ts   # if project-wide test layout separates unit tests
```

**Structure Decision**: Single-project layout (Option 1 from the template).
Seed content lives under `content/prompts/<pairing>/<type>.json` as flat JSON
arrays of prompt strings — simplest possible format satisfying "files on
server" and easy to hand-edit or extend later. A single `src/content/`
module owns loading and selection logic; it has no dependency on how
`001-truth-or-dare` transports data to clients.

## Complexity Tracking

> No constitution violations — table intentionally omitted.
