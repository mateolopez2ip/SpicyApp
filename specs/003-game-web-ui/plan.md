# Implementation Plan: Truth or Dare Web Game UI

**Branch**: `003-game-web-ui` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-game-web-ui/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A static, dependency-free web client (plain HTML/CSS/JavaScript, no
framework or build step) served from the existing Express server. It walks
players through name/gender entry, create-or-join, the waiting room, the
round-count step, the Truth/Dare turn screen, and the end-of-game screen
with a "Play again" action — all by calling the `001-truth-or-dare` REST
API and polling `GET /sessions/:id` for updates. Screen/control selection
logic (whose turn, which controls to show, which screen to render) is
extracted into small pure functions so it can be unit-tested without a
browser. "Play again" requires one small addition to `001-truth-or-dare`'s
API: a restart action that resets an `ended` session back to a
rounds-not-yet-set state under the same session number (per this feature's
Clarifications).

## Technical Context

**Language/Version**: Plain JavaScript (ES modules, no transpilation) for
the browser client; TypeScript 5.x on Node.js 20 LTS for the one small
server-side addition (the restart endpoint), consistent with
`001-truth-or-dare`/`002-seed-prompt-content`.

**Primary Dependencies**: None new. The browser client uses native
`fetch`/DOM APIs only — no frontend framework, bundler, or build step. The
server continues to use the existing Express app from `001-truth-or-dare`.

**Storage**: N/A for this feature — the client holds no persistent state of
its own; all game state remains server-side, file-backed, per
`001-truth-or-dare`/constitution v1.1.0.

**Testing**: Node's built-in test runner (`node:test`) for the pure
view-state selection functions (`public/viewState.js`), which have no DOM
or network dependency and can be imported directly by tests. DOM wiring
itself (`public/app.js`) is a thin adapter validated manually via
quickstart.md's browser walkthrough rather than an automated browser-test
framework (see Constitution Check for rationale).

**Target Platform**: Modern desktop and mobile web browsers, served as
static files by the existing Node/Express server.

**Project Type**: Web application — static frontend assets added to the
existing single-project backend (no separate frontend project/build
pipeline).

**Performance Goals**: Screen updates reflect server-side state changes
within 2 seconds (SC-003), achieved via ~1s client polling, matching
`001-truth-or-dare`'s existing polling design (research.md there).

**Constraints**: No new frontend framework/bundler (Simplicity & YAGNI);
no database (N/A — UI itself persists nothing); depends on one new
`001-truth-or-dare` API action (session restart) that does not exist yet.

**Scale/Scope**: 5 client screens/states (setup form, waiting room,
round-count form, turn/game screen, end-of-game screen), covering the 3
P1 user stories in spec.md.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Test-First**: The pure view-state logic (`public/viewState.js`) will
  have unit tests written first, per constitution. DOM-wiring code
  (`public/app.js`) has no meaningful unit-testable logic of its own once
  view-state is extracted — it's a thin adapter (fetch calls + DOM
  updates) — and is instead validated via the manual quickstart.md browser
  walkthrough. This mirrors the same test/thin-adapter split already used
  in `001-truth-or-dare` (`sessionService.ts` tested; `httpApi.ts` routes
  covered by contract tests). ✅ PASS
- **II. Simplicity & YAGNI**: No new framework, bundler, or build step;
  reuses the existing Express server as a static file host. ✅ PASS
- **III. User Experience Consistency**: All 5 screens share one page shell,
  one stylesheet, and consistent copy/interaction patterns (e.g., the same
  "waiting for..." treatment appears both before round-count and — new in
  this plan — before a restarted game). ✅ PASS
- **IV. Code Review & Quality Gates**: Standard PR/test/lint gates apply;
  no exception needed. ✅ PASS
- **V. Versioning & Breaking Changes**: The new `POST /sessions/:id/restart`
  endpoint is a backward-compatible *addition* to `001-truth-or-dare`'s
  contract (no existing endpoint's behavior changes), so it does not
  require a breaking-change migration note. ✅ PASS
- **Additional Constraints (no database)**: This feature adds no server-side
  storage of its own; it reuses `001-truth-or-dare`'s file-backed session
  store. ✅ PASS

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-game-web-ui/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
public/
├── index.html            # single page shell; screens are shown/hidden by app.js
├── styles.css             # shared styles for all screens (UX consistency)
├── viewState.js           # pure functions: which screen/controls to show for a given session + "my" playerId
├── viewState.test.js      # node:test unit tests for viewState.js
└── app.js                 # DOM wiring: fetch calls to the 001 API, ~1s polling loop, event listeners

src/session/
├── sessionService.ts       # existing (001) — gains restartSession(sessionId)
├── sessionService.test.ts  # existing — gains restart tests
├── httpApi.ts               # existing — gains POST /sessions/:id/restart route, and now also serves public/ as static files
└── httpApi.test.ts          # existing — gains a restart contract test
```

**Structure Decision**: Single-project layout (Option 1), extending the
existing repository. No `frontend/`/`backend/` split — the "frontend" is a
handful of static files served by the same Express app already running
`001-truth-or-dare`'s API, added via `express.static("public")` in
`httpApi.ts`. This avoids standing up a second server/process or build
pipeline for what is currently a small, dependency-free client.
