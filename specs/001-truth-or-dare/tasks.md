---

description: "Task list template for feature implementation"
---

# Tasks: Truth or Dare Couples Game

**Input**: Design documents from `/specs/001-truth-or-dare/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Included — the project constitution (Principle I, Test-First, NON-NEGOTIABLE) requires tests to be written before implementation for every feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All three user stories in spec.md are P1 (they form a single sequential gameplay loop), so they are ordered US1 → US2 → US3 per their spec order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project layout, per plan.md:
- `src/session/` — session/turn service, store, and HTTP API
- `data/sessions/` — runtime session JSON files
- `server.ts` — HTTP entrypoint

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization for the session/turn feature

- [X] T001 Add `express` and `@types/express` to `package.json` dependencies
- [X] T002 Ensure `data/sessions/` exists at runtime (create-if-missing logic, since the directory itself isn't committed) — add the creation call in `src/session/sessionStore.ts` (stubbed here, implemented in T005)
- [X] T003 [P] Create `server.ts` entrypoint that wires the Express app from `src/session/httpApi.ts` onto an HTTP listener (`PORT` env var, default 3000)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and file-backed storage that all three user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Define `Player`, `Turn`, `Session`, and `SessionView` types in `src/session/types.ts` per data-model.md
- [X] T005 Implement file-backed `sessionStore.ts` in `src/session/sessionStore.ts`: `loadSession(sessionId)`, `saveSession(session)` (atomic write-temp-then-rename into `data/sessions/`, creating the directory if missing), and a per-`sessionId` in-memory write queue serializing all mutations, per research.md (depends on T004)
- [X] T006 Create test scaffolds `src/session/sessionService.test.ts` and `src/session/httpApi.test.ts`, wired into the existing `npm test` glob

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Start a Coordinated Session Across Two Devices (Priority: P1) 🎯 MVP

**Goal**: One player creates a session and gets a session number; a second player joins with it; both agree on a round count (1-20) and the app randomly picks who goes first.

**Independent Test**: Create a session on device A, join it from device B with the session number, set a round count, and confirm `GET /sessions/:id` shows identical player/round/activePlayer data from both "devices" (both callers).

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T007 [P] [US1] Unit tests for `createSession` (valid name/gender succeeds; empty name or invalid gender rejected) in `src/session/sessionService.test.ts`
- [X] T008 [P] [US1] Unit tests for `joinSession` (second player joins successfully; unknown/expired sessionId rejected; joining a session that already has 2 players rejected) in `src/session/sessionService.test.ts`
- [X] T009 [P] [US1] Unit tests for `setRounds` (accepts 1-20; rejects out-of-range or a session without 2 players yet; randomly assigns `activePlayerId` and sets `status` to `in_progress`) in `src/session/sessionService.test.ts`
- [X] T010 [P] [US1] Contract tests for `POST /sessions`, `POST /sessions/:id/join`, `POST /sessions/:id/rounds`, `GET /sessions/:id` per contracts/api.md in `src/session/httpApi.test.ts`

### Implementation for User Story 1

- [X] T011 [US1] Implement `createSession(name, gender)` in `src/session/sessionService.ts` (depends on T005)
- [X] T012 [US1] Implement `joinSession(sessionId, name, gender)` in `src/session/sessionService.ts`, including the 15-minute unjoined-session lazy-expiry check and the 2-player cap (depends on T011)
- [X] T013 [US1] Implement `setRounds(sessionId, roundCount)` in `src/session/sessionService.ts`, validating the 1-20 range and randomly assigning `activePlayerId` when transitioning to `in_progress` (depends on T012)
- [X] T014 [US1] Implement `POST /sessions`, `POST /sessions/:id/join`, `POST /sessions/:id/rounds`, and `GET /sessions/:id` routes in `src/session/httpApi.ts`, mapping service errors to the status codes in contracts/api.md (depends on T011, T012, T013)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — two callers can coordinate a session and agree on rounds.

---

## Phase 4: User Story 2 - Take a Turn Choosing Truth or Dare (Priority: P1)

**Goal**: The active player picks Truth or Dare; the resulting prompt (from `002-seed-prompt-content`, matched to the couple's gender pairing) becomes visible to both players via `GET /sessions/:id`.

**Independent Test**: With a session already `in_progress` (from US1), call the choice endpoint as the active player and confirm `currentTurn.choice`/`currentTurn.prompt` are set and visible via a subsequent `GET`.

### Tests for User Story 2 ⚠️

- [X] T015 [P] [US2] Unit tests for `chooseTruthOrDare` (active player choosing truth/dare draws a prompt via `getPrompt` for the session's gender pairing; non-active player choosing is rejected; choosing again before confirmation is rejected) in `src/session/sessionService.test.ts`
- [X] T016 [P] [US2] Contract test for `POST /sessions/:id/turn/choice` per contracts/api.md in `src/session/httpApi.test.ts`

### Implementation for User Story 2

- [X] T017 [US2] Implement `chooseTruthOrDare(sessionId, playerId, choice)` in `src/session/sessionService.ts`, deriving the gender pairing from the two players and calling `getPrompt` from `src/content/promptLibrary.ts`, storing the returned `sessionQueue` back on the session (depends on T013)
- [X] T018 [US2] Implement `POST /sessions/:id/turn/choice` route in `src/session/httpApi.ts` (depends on T017)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently — a session can be set up and a turn's content shown to both players.

---

## Phase 5: User Story 3 - Confirm the Turn and Advance to the Next Player (Priority: P1)

**Goal**: The non-active player confirms the turn via "OK"; play advances to the other player and the round counter progresses until the agreed round count ends the game.

**Independent Test**: With a turn's choice already made (from US2), call the confirm endpoint as the non-active player and confirm `activePlayerId` swaps, `currentRoundNumber` increments, and the session ends once `roundCount` is reached.

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Unit tests for `confirmTurn` (non-active player's confirm advances the turn and increments the round; active player attempting to confirm is rejected; confirming with no choice made yet is rejected; confirming the final round sets `status` to `ended`) in `src/session/sessionService.test.ts`
- [X] T020 [P] [US3] Contract test for `POST /sessions/:id/turn/confirm` per contracts/api.md in `src/session/httpApi.test.ts`

### Implementation for User Story 3

- [X] T021 [US3] Implement `confirmTurn(sessionId, playerId)` in `src/session/sessionService.ts`: validate the caller is the non-active player and a choice exists, then swap `activePlayerId`, increment `currentRoundNumber`, reset `currentTurn`, and set `status` to `ended` once the round count is exceeded (depends on T017)
- [X] T022 [US3] Implement `POST /sessions/:id/turn/confirm` route in `src/session/httpApi.ts` (depends on T021)

**Checkpoint**: All user stories should now be independently functional — the full create → join → set rounds → choose → confirm → end game loop works end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect the whole feature

- [X] T023 [P] Run the quickstart.md curl walkthrough against a running server (`server.ts`) end-to-end and fix any discrepancies
- [X] T024 [P] Document the Session/Turn HTTP API (base URL, endpoints, example requests) in `README.md`
- [X] T025 Code cleanup pass on `src/session/sessionService.ts` and `src/session/httpApi.ts` (naming, error messages, remove dead code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion; its implementation (T017) depends on `setRounds` (T013) from US1, since a turn can only be chosen once a session is `in_progress`
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion; its implementation (T021) depends on `chooseTruthOrDare` (T017) from US2, since a turn can only be confirmed after a choice is made
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — session setup is the entry point and the MVP.
- **User Story 2 (P1)**: Requires a session already `in_progress`, i.e. built on US1's `setRounds`. Its own tests/implementation are independently addressable once that precondition exists.
- **User Story 3 (P1)**: Requires a turn already chosen, i.e. built on US2's `chooseTruthOrDare`. Its own tests/implementation are independently addressable once that precondition exists.

### Within Each User Story

- Tests written and FAILING before implementation (T007-T010 before T011-T014; T015-T016 before T017-T018; T019-T020 before T021-T022)
- Service logic (`sessionService.ts`) before HTTP routes (`httpApi.ts`) that call it
- Story complete before moving to next priority

### Parallel Opportunities

- T003 (server.ts) can run parallel to T001/T002
- T004 and T006 (Phase 2) can run in parallel; T005 depends on T004
- T007-T010 (all US1 tests) can run in parallel — same file but independent test cases, write together before implementing
- T015-T016 (US2 tests) can run in parallel; T019-T020 (US3 tests) can run in parallel
- T023 and T024 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Draft all US1 tests together (same test file, independent cases):
Task: "Unit tests for createSession in src/session/sessionService.test.ts"
Task: "Unit tests for joinSession in src/session/sessionService.test.ts"
Task: "Unit tests for setRounds in src/session/sessionService.test.ts"
Task: "Contract tests for session endpoints in src/session/httpApi.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run the User Story 1 portion of quickstart.md; confirm two callers can coordinate a session
5. This is a usable MVP for session coordination, ready for US2/US3 to build the gameplay loop on top

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → session coordination works
3. Add User Story 2 → Test independently → turn content sync works
4. Add User Story 3 → Test independently → full turn loop and game-end works
5. Polish phase → quickstart validation, docs, cleanup

---

## Notes

- [P] tasks = different files or independent test cases, no blocking dependencies
- [Story] label maps task to specific user story for traceability
- Although US2 and US3 build on preconditions from earlier stories (a session must exist/be in progress), each still has its own tests and implementation task that can be worked on as soon as that precondition is met
- Commit after each task or logical group
- Stop at the Phase 3 checkpoint to validate session coordination before starting the turn-taking phases
