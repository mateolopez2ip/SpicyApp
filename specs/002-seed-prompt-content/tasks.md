---

description: "Task list template for feature implementation"
---

# Tasks: Seed Prompt Content Library

**Input**: Design documents from `/specs/002-seed-prompt-content/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/prompt-library.md, quickstart.md

**Tests**: Included — the project constitution (Principle I, Test-First, NON-NEGOTIABLE) requires tests to be written before implementation for every feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Single project layout, per plan.md:
- `content/prompts/<pairing>/<type>.json` — seed content files
- `src/content/` — prompt library module and its tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directories `content/prompts/male-female/`, `content/prompts/male-male/`, `content/prompts/female-female/`, and `src/content/` per plan.md Project Structure
- [X] T002 Initialize Node.js/TypeScript project: `package.json` (Node 20 LTS target), `tsconfig.json`, and a `"test": "node --test --import tsx"` (or equivalent compiled) script per research.md
- [X] T003 [P] Configure linting/formatting (eslint + prettier config) at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and scaffolding that both user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Define shared `Pairing` (`"male-female" | "male-male" | "female-female"`) and `PromptType` (`"truth" | "dare"`) types in `src/content/types.ts`
- [X] T005 Create empty test file scaffold `src/content/promptLibrary.test.ts` wired into the `test` script from T002

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Play a Game With a Ready-Made Content Library (Priority: P1) 🎯 MVP

**Goal**: Deliver the 6 seed pool files (3 pairings × 2 types, ≥6 prompts each) plus `loadPool`/`getPrompt` so a turn always has content to show, with no repeats within a session until a pool is exhausted.

**Independent Test**: Start a session for each of the 3 pairings and call `getPrompt` repeatedly for both Truth and Dare; confirm content is always returned and no prompt repeats before the pool cycles.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T006 [P] [US1] Unit test `loadPool()` reads a pool file and returns ≥6 prompt strings, and throws on a missing/undersized file, in `src/content/promptLibrary.test.ts`
- [X] T007 [P] [US1] Unit test `getPrompt()` never repeats a prompt for a given `(pairing, type)` session queue until all prompts in that pool have been returned once, then reshuffles and continues, in `src/content/promptLibrary.test.ts`

### Implementation for User Story 1

- [X] T008 [P] [US1] Author male-female Truth pool content (≥6 prompts) in `content/prompts/male-female/truth.json`
- [X] T009 [P] [US1] Author male-female Dare pool content (≥6 prompts) in `content/prompts/male-female/dare.json`
- [X] T010 [P] [US1] Author male-male Truth pool content (≥6 prompts) in `content/prompts/male-male/truth.json`
- [X] T011 [P] [US1] Author male-male Dare pool content (≥6 prompts) in `content/prompts/male-male/dare.json`
- [X] T012 [P] [US1] Author female-female Truth pool content (≥6 prompts) in `content/prompts/female-female/truth.json`
- [X] T013 [P] [US1] Author female-female Dare pool content (≥6 prompts) in `content/prompts/female-female/dare.json`
- [X] T014 [US1] Implement `loadPool(pairing, type)` in `src/content/promptLibrary.ts` reading and validating the corresponding JSON file (depends on T008-T013, T004)
- [X] T015 [US1] Implement `getPrompt(pairing, type, sessionQueue)` shuffle/pop/reshuffle logic in `src/content/promptLibrary.ts` per contracts/prompt-library.md (depends on T014)
- [X] T016 [US1] Add content-integrity error handling (missing file, invalid JSON, <6 entries) to `loadPool`/`getPrompt` in `src/content/promptLibrary.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — every pairing has usable, non-repeating content.

---

## Phase 4: User Story 2 - Consistent Sensual Tone Across All Seed Content (Priority: P2)

**Goal**: Ensure every seed prompt across all 6 pools reads as flirtatious/sensual (not neutral party-game content, not graphically explicit), per FR-004.

**Independent Test**: Sample prompts from each of the 6 pools and confirm each one matches the intended tone.

### Tests for User Story 2 ⚠️

- [X] T017 [P] [US2] Unit test asserting every prompt in every pool file is non-empty and meets a minimum length/content heuristic (basic automatable proxy for tone review) in `src/content/promptLibrary.test.ts`

### Implementation for User Story 2

- [X] T018 [US2] Perform an editorial tone review of all 36 seed prompts across the 6 pool files against FR-004, recording findings in `specs/002-seed-prompt-content/content-review.md`
- [X] T019 [US2] Revise any pool entries flagged by the review directly in `content/prompts/*/*.json` (depends on T018, and on T008-T013 existing) — no-op, review found no issues (see content-review.md)

**Checkpoint**: All user stories should now be independently functional — content exists (US1) and is tone-consistent (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect the whole feature

- [X] T020 [P] Run the quickstart.md pool-file validation script and fix any reported issues
- [X] T021 [P] Document the `content/prompts/` layout and how to add more prompts later in `README.md`
- [X] T022 Code cleanup pass on `src/content/promptLibrary.ts` (naming, error messages, remove dead code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS both user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion; its review task (T018) reads the content files created in US1 (T008-T013), so in practice runs after US1's content-authoring tasks
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — this is the MVP.
- **User Story 2 (P2)**: Reviews/refines the content files US1 authors; not independently testable *before* US1's content exists, but does not require US1's code (`loadPool`/`getPrompt`) to be finished — only the JSON files.

### Within Each User Story

- Tests written and FAILING before implementation (T006-T007 before T014-T016; T017 before T018-T019)
- Content authoring (data) before library code that reads it
- Story complete before moving to next priority

### Parallel Opportunities

- T003 (linting) can run parallel to T001/T002
- T004 and T005 (Phase 2) can run in parallel
- T006 and T007 (US1 tests) can run in parallel
- T008-T013 (all 6 pool content files) can all run in parallel — different files, no shared state
- T020 and T021 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch both US1 tests together:
Task: "Unit test loadPool() in src/content/promptLibrary.test.ts"
Task: "Unit test getPrompt() no-repeat behavior in src/content/promptLibrary.test.ts"

# Launch all 6 pool content files together:
Task: "Author content/prompts/male-female/truth.json"
Task: "Author content/prompts/male-female/dare.json"
Task: "Author content/prompts/male-male/truth.json"
Task: "Author content/prompts/male-male/dare.json"
Task: "Author content/prompts/female-female/truth.json"
Task: "Author content/prompts/female-female/dare.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run quickstart.md checks; confirm every pairing returns non-repeating content
5. This is a usable MVP — `001-truth-or-dare` can already draw prompts from it

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP ready for `001-truth-or-dare` to consume
3. Add User Story 2 → Tone-review and refine content → Deploy/Demo
4. Polish phase → Documentation and cleanup

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature has no database and no external API surface — all "contract" work is the in-process `getPrompt`/`loadPool` functions in contracts/prompt-library.md
- Commit after each task or logical group
- Stop at the Phase 3 checkpoint to validate the MVP independently before starting Phase 4
