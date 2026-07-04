# Implementation Plan: Rounds-Completed Counter

**Branch**: `004-rounds-completed-counter` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-rounds-completed-counter/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a clearly labeled "rounds completed" counter to the existing turn
screen and end-of-game screen in `003-game-web-ui`, derived from data the
UI already polls (`currentRoundNumber`, `roundCount`, `status`) — no new
backend endpoint or session/turn field is needed. A new pure function,
`computeRoundsCompleted(session)`, computes the count; `formatRoundProgress`
composes it into the existing round-progress label instead of duplicating
display logic.

## Technical Context

**Language/Version**: Plain JavaScript (ES modules), same as
`003-game-web-ui`'s `public/viewState.js`/`public/app.js`. No backend
language change.

**Primary Dependencies**: None new.

**Storage**: N/A — no new persisted data; derives from existing `Session`
fields already defined in `001-truth-or-dare/data-model.md`.

**Testing**: `node:test`, extending `public/viewState.test.js`.

**Target Platform**: Same as `003-game-web-ui` — browsers, static files
served by the existing Express server.

**Project Type**: Web application — small UI addition to the existing
single-project structure.

**Performance Goals**: No new performance requirement; inherits the
existing ~2s sync target already met by `003-game-web-ui`'s polling loop.

**Constraints**: Must not duplicate or contradict the existing
round-progress label; must derive its value from already-polled data only
(no new endpoint).

**Scale/Scope**: One new pure function + one small edit to an existing
render function and to `index.html`'s turn/end-of-game markup.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Test-First**: `computeRoundsCompleted()` is a pure function; its
  unit tests are written first. ✅ PASS
- **II. Simplicity & YAGNI**: No new backend field/endpoint; reuses
  existing polled data. ✅ PASS
- **III. User Experience Consistency**: Reuses the existing round-progress
  label location/styling rather than introducing a separate new visual
  element. ✅ PASS
- **IV. Code Review & Quality Gates**: Standard gates apply. ✅ PASS
- **V. Versioning & Breaking Changes**: No API contract changes. ✅ PASS
- **Additional Constraints (no database)**: No new storage. ✅ PASS

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-rounds-completed-counter/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory is created for this feature: it adds no new
HTTP endpoint or externally-consumed interface — only an internal pure
function documented directly in data-model.md.

### Source Code (repository root)

```text
public/
├── viewState.js           # gains computeRoundsCompleted(session); formatRoundProgress() reuses it
├── viewState.test.js       # gains tests for computeRoundsCompleted()
├── index.html              # turn screen's existing round-progress element also shows rounds completed; end-of-game screen gains one
└── app.js                  # render() populates the end-of-game rounds-completed text from computeRoundsCompleted()
```

**Structure Decision**: No new files/directories — this is a small,
additive change entirely within `003-game-web-ui`'s existing `public/`
structure.
