---

description: "Task list template for feature implementation"
---

# Tasks: Truth or Dare Web Game UI

**Input**: Design documents from `/specs/003-game-web-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-extension.md, contracts/ui-view-state.md, quickstart.md

**Tests**: Included — the project constitution (Principle I, Test-First, NON-NEGOTIABLE) requires tests to be written before implementation. Per plan.md's Constitution Check, pure `viewState.js` logic and the new `restartSession` backend logic get unit/contract tests; DOM-wiring in `app.js` is validated via quickstart.md's manual browser walkthrough instead (documented, consistent with `001-truth-or-dare`'s service/route test split).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All three user stories in spec.md are P1, ordered US1 → US2 → US3 per their spec order (each builds on the game state the previous one reaches).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md:
- `public/` — static web client (`index.html`, `styles.css`, `viewState.js`, `viewState.test.js`, `app.js`)
- `src/session/` — existing `001-truth-or-dare` backend, gaining the restart action

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization for the web client

- [X] T001 Create `public/` directory with empty `index.html`, `styles.css`, `viewState.js`, and `app.js` files per plan.md Project Structure
- [X] T002 [P] Update the `test` script in `package.json` so the `node:test` glob also includes `public/**/*.test.js`
- [X] T003 [P] Wire `express.static("public")` into `createHttpApi()` in `src/session/httpApi.ts` so the client is served by the existing server

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared page shell, styles, and API-client plumbing that all three user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create `public/viewState.test.js` scaffold (empty `describe`), wired into the updated test glob (depends on T002)
- [X] T005 Build `public/index.html` markup with containers for all 5 screens (`setup`, `waiting_for_player`, `rounds_form`, `turn`, `end_of_game`) and `public/styles.css` shared styles applied consistently across them, per Constitution Principle III (UX Consistency)
- [X] T006 Implement API-client helper functions in `public/app.js` wrapping `fetch` calls to the `001-truth-or-dare` endpoints (`createSession`, `joinSession`, `setRounds`, `getSession`, `chooseTruthOrDare`, `confirmTurn`) per `specs/001-truth-or-dare/contracts/api.md` (depends on T003)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Set Up a Game From Two Devices (Priority: P1) 🎯 MVP

**Goal**: A player can enter name/gender, start or join a session, see the waiting room update automatically, and agree on a round count with the other player.

**Independent Test**: Open two browser tabs, create a session in one, join from the other using the shown session number, set a round count, and confirm both tabs show the same players/round count and move past the round-count screen.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T007 [P] [US1] Unit tests for `computeScreen(session, myPlayerId)` covering: no session yet → `"setup"`; waiting with 1 player → `"waiting_for_player"`; waiting with 2 players → `"rounds_form"` in `public/viewState.test.js`

### Implementation for User Story 1

- [X] T008 [US1] Implement `computeScreen()` in `public/viewState.js` per contracts/ui-view-state.md (depends on T007)
- [X] T009 [US1] Implement the setup screen in `public/app.js`/`public/index.html`: name/gender inputs, "Start a new game" and "Join" actions calling `createSession`/`joinSession`, storing the resulting `myPlayerId`/`sessionId` in `sessionStorage`, with inline validation per FR-013 (depends on T006, T008)
- [X] T010 [US1] Implement the ~1s polling loop in `public/app.js` that calls `getSession`, recomputes the screen via `computeScreen()`, and re-renders the waiting-room screen automatically (depends on T009)
- [X] T011 [US1] Implement the round-count form screen in `public/app.js`/`public/index.html`: numeric input validated against 1-20 before submission (FR-005/FR-013), calling `setRounds` (depends on T010)
- [X] T012 [US1] Wire clear error display in `public/app.js` for session-number errors (404 unknown/expired, 409 already full) per FR-012

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — two browser tabs can coordinate a session and reach the started-game state.

---

## Phase 4: User Story 2 - See the Turn's Truth Question or Dare Action (Priority: P1)

**Goal**: The active player sees Truth/Dare options; once chosen, both players see the resulting prompt and whose turn it is.

**Independent Test**: With a game already started (User Story 1), have the active tab choose Truth or Dare and confirm the resulting prompt appears on both tabs without a manual refresh, with choice controls hidden from the non-active tab.

### Tests for User Story 2 ⚠️

- [X] T013 [P] [US2] Unit tests for `computeTurnControls(session, myPlayerId)` covering: active player with no choice yet → `showChoiceButtons: true`; active player after choosing → both false; non-active player before a choice → both false; non-active player after a choice → `showOkButton: true` in `public/viewState.test.js`

### Implementation for User Story 2

- [X] T014 [US2] Implement `computeTurnControls()` in `public/viewState.js` per contracts/ui-view-state.md (depends on T013)
- [X] T015 [US2] Implement the turn screen in `public/app.js`/`public/index.html`: Truth/Dare buttons shown per `computeTurnControls()`, calling `chooseTruthOrDare`; render the resulting prompt text and a clear "whose turn" indicator on both tabs via the existing polling loop (depends on T014, T010)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently — a session can be set up and a turn's content shown to both players.

---

## Phase 5: User Story 3 - Confirm the Turn and See the Game Progress (Priority: P1)

**Goal**: The non-active player confirms the turn with "OK", play advances with updated round progress, and the game ends with a "Play again" option that restarts the same session.

**Independent Test**: With a turn's choice already showing (User Story 2), press "OK" as the non-active tab and confirm both tabs advance to the next player and updated round count; after reaching the round limit, confirm the end-of-game screen appears and "Play again" returns both tabs to the round-count screen.

### Tests for User Story 3 ⚠️

- [X] T016 [P] [US3] Unit tests for `formatRoundProgress(session)` (e.g., "Round 2 of 5", and `""` when `roundCount` is `null`) in `public/viewState.test.js`
- [X] T017 [P] [US3] Unit tests for `restartSession(sessionId)` in `src/session/sessionService.ts`: resets an `ended` session to `waiting` with `roundCount`/`currentRoundNumber`/`activePlayerId`/`currentTurn`/`promptQueues` cleared but `players` unchanged; rejects (409) a session that isn't `ended` in `src/session/sessionService.test.ts`
- [X] T018 [P] [US3] Contract test for `POST /sessions/:id/restart` per contracts/api-extension.md in `src/session/httpApi.test.ts`

### Implementation for User Story 3

- [X] T019 [US3] Implement `formatRoundProgress()` in `public/viewState.js` (depends on T016)
- [X] T020 [US3] Wire the "OK" confirmation control into the turn screen in `public/app.js`, calling `confirmTurn`, and display `formatRoundProgress()` output (depends on T014, T015, T019)
- [X] T021 [US3] Implement `restartSession(sessionId)` in `src/session/sessionService.ts` per data-model.md's Session state-machine amendment (depends on T017)
- [X] T022 [US3] Implement `POST /sessions/:id/restart` route in `src/session/httpApi.ts` (depends on T018, T021)
- [X] T023 [US3] Implement the end-of-game screen in `public/app.js`/`public/index.html` with a "Play again" button calling the new restart endpoint, returning both polling tabs to the round-count screen (depends on T022, T020)

**Checkpoint**: All user stories should now be independently functional — the full setup → turn → confirm → end-of-game → play-again loop works end-to-end in the browser.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect the whole feature

- [X] T024 [P] Run the quickstart.md manual two-tab browser walkthrough end-to-end and fix any discrepancies
- [X] T025 [P] Document how to open/use the web UI in `README.md`
- [X] T026 Code cleanup pass on `public/app.js`, `public/viewState.js`, and the `src/session/*.ts` additions (naming, error messages, remove dead code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion; its implementation (T015) reuses the polling loop built in US1 (T010) and requires a session already `in_progress`
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion; its implementation depends on the turn screen from US2 (T014/T015) to attach the OK control, and independently adds the new backend restart action
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — session setup is the entry point and the MVP.
- **User Story 2 (P1)**: Requires a session already `in_progress`, built on US1's round-count/polling work.
- **User Story 3 (P1)**: Requires a turn already chosen (US2) to attach its OK control, but its `restartSession`/route work (T017-T022) is independent backend work that can proceed in parallel with US2 if staffed separately.

### Within Each User Story

- Tests written and FAILING before implementation (T007 before T008-T012; T013 before T014-T015; T016-T018 before T019-T023)
- Pure `viewState.js` functions before the `app.js` screens that call them
- Story complete before moving to next priority

### Parallel Opportunities

- T002 and T003 (Setup) can run in parallel
- T004 and T005 (Phase 2) can run in parallel; T006 depends on T003
- T016, T017, T018 (US3 tests) can all run in parallel — different files/independent cases
- T024 and T025 (Polish) can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all US3 tests together (independent files/cases):
Task: "Unit tests for formatRoundProgress() in public/viewState.test.js"
Task: "Unit tests for restartSession() in src/session/sessionService.test.ts"
Task: "Contract test for POST /sessions/:id/restart in src/session/httpApi.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run the User Story 1 portion of quickstart.md (steps 1-4); confirm two tabs can coordinate a session
5. This is a usable MVP for game setup, ready for US2/US3 to build the turn loop on top

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → session setup works in the browser
3. Add User Story 2 → Test independently → turn content sync works in the browser
4. Add User Story 3 → Test independently → confirm/advance/end/restart loop works in the browser
5. Polish phase → full quickstart validation, docs, cleanup

---

## Notes

- [P] tasks = different files or independent test cases, no blocking dependencies
- [Story] label maps task to specific user story for traceability
- DOM-wiring tasks (`app.js`/`index.html`) have no dedicated automated test task by design — see the Tests note at the top; they are validated via quickstart.md in Phase 6
- Commit after each task or logical group
- Stop at the Phase 3 checkpoint to validate session setup in the browser before starting the turn-taking phases
