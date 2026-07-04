---

description: "Task list template for feature implementation"
---

# Tasks: Rounds-Completed Counter

**Input**: Design documents from `/specs/004-rounds-completed-counter/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — the project constitution (Principle I, Test-First, NON-NEGOTIABLE) requires tests to be written before implementation. `computeRoundsCompleted()` is a pure function and gets unit tests; the small `index.html`/`app.js` display wiring is validated via quickstart.md's manual walkthrough, consistent with `003-game-web-ui`'s established test/thin-adapter split.

**Organization**: This is a small, single-story feature — one P1 user story, no Setup/Foundational phases needed since it's an additive change to the existing `003-game-web-ui` project (no new dependencies, files, or infrastructure).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 - See How Many Rounds Have Been Played (Priority: P1) 🎯 MVP

**Goal**: Display a rounds-completed counter on the turn screen and the end-of-game screen, updating automatically on both players' devices.

**Independent Test**: Play through several turns of a game and confirm the rounds-completed counter increases by one per confirmed turn on both screens, and that the end-of-game screen shows the final total.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T001 [P] [US1] Unit tests for `computeRoundsCompleted(session)` covering: `null`/`waiting` → `0`; `in_progress` at various `currentRoundNumber` values → `currentRoundNumber - 1`; `ended` → `roundCount` in `public/viewState.test.js`

### Implementation for User Story 1

- [X] T002 [US1] Implement `computeRoundsCompleted()` in `public/viewState.js` per data-model.md (depends on T001)
- [X] T003 [US1] Add a rounds-completed display element to the turn screen (`#screen-turn`) and the end-of-game screen (`#screen-end_of_game`) in `public/index.html`
- [X] T004 [US1] Update `render()` in `public/app.js` to populate the new element(s) with `computeRoundsCompleted()`'s output on every poll tick (depends on T002, T003)

**Checkpoint**: The rounds-completed counter is visible and correct on both the turn screen and the end-of-game screen, updating automatically across both players' devices.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Validation and documentation

- [X] T005 [P] Run the quickstart.md manual two-tab browser walkthrough end-to-end and fix any discrepancies
- [X] T006 [P] Update the "Web UI" section of `README.md` to mention the rounds-completed counter
- [X] T007 Code cleanup pass on the `public/viewState.js`, `public/app.js`, and `public/index.html` changes (naming, remove dead code)

---

## Dependencies & Execution Order

- T001 before T002 (test before implementation)
- T002 and T003 can run in parallel with each other, but T004 depends on both
- Polish (T005-T007) depends on Phase 1 being complete; T005 and T006 can run in parallel

## Parallel Example

```bash
Task: "Unit tests for computeRoundsCompleted() in public/viewState.test.js"
# then, once T001 is red:
Task: "Implement computeRoundsCompleted() in public/viewState.js"
Task: "Add rounds-completed markup to public/index.html"
```

## Implementation Strategy

Since this is a single small P1 story, implement it straight through
(T001-T004), validate via quickstart.md, then do Polish. No incremental
MVP staging is needed beyond the story itself.

## Notes

- No Setup/Foundational phases: this feature adds no new dependencies,
  files, or infrastructure beyond what `003-game-web-ui` already has.
- Commit after each task or logical group.
