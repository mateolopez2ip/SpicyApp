# Implementation Plan: Truth or Dare Couples Game

**Branch**: `001-truth-or-dare` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-truth-or-dare/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two players coordinate a game session across two devices using a
session number: one creates the session, the other joins with that number.
Both enter name/gender and agree on a round count (1-20); the app randomly
picks who goes first. Players then take turns choosing Truth or Dare; the
resulting prompt (drawn from the `002-seed-prompt-content` library, matched
to the couple's gender pairing) is shown identically on both devices. The
non-active player presses "OK" to confirm the turn, which advances play to
the other player until the agreed round count is reached, ending the game.
All session/turn state is held in server memory and persisted to a JSON file
per session (no database), with a small REST API polled by both devices to
stay in sync within the 2-second targets set by SC-002/SC-003.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (same stack as
`002-seed-prompt-content`).

**Primary Dependencies**: Express (or an equally minimal HTTP framework) for
the REST API; no realtime/WebSocket library — short-interval polling from
the client satisfies the 2-second sync targets without that complexity.

**Storage**: Files — one JSON file per session at
`data/sessions/<sessionId>.json`, written through an in-memory per-session
write queue to avoid corrupting concurrent read-modify-write cycles. No
database, per constitution v1.1.0.

**Testing**: Node's built-in test runner (`node:test`), consistent with
`002-seed-prompt-content`.

**Target Platform**: Linux server (Node process) serving a web/mobile client
over HTTP; the two players' devices are simply two HTTP clients polling/
posting to the same session.

**Project Type**: Web application — single backend service (REST API +
session/turn logic) consumed by a client (client UI implementation is a
separate concern/feature; this plan covers the server-side session/turn
engine and its HTTP contract).

**Performance Goals**: Session creation/join under 1s (SC-001); a client
polling every ~1s sees a new prompt or turn change within 2s (SC-002,
SC-003).

**Constraints**: No database (constitution v1.1.0); exactly 2 players per
session (FR-004); round count bounded 1-20 (FR-005); unjoined sessions
expire after 15 minutes; reconnecting devices must recover current turn
state by simply re-fetching (no special "resume" flow).

**Scale/Scope**: Designed for many concurrent small (2-player) sessions on a
single server process; no multi-server/session-affinity concerns in this
scope (file storage is local to one process).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Test-First**: Session/turn state-machine logic (create, join, set
  rounds, choose, confirm, expiry) is pure/testable and will have unit tests
  written first. ✅ PASS
- **II. Simplicity & YAGNI**: Polling over WebSockets, one dependency
  (Express) only for HTTP routing, no session-affinity/clustering support
  since not required at this scale. ✅ PASS
- **III. User Experience Consistency**: This plan covers the server only;
  client UI consistency is deferred to whatever feature implements the
  actual screens, which must reuse this API. N/A for this plan's scope.
- **IV. Code Review & Quality Gates**: Standard PR/test/lint gates apply.
  ✅ PASS
- **V. Versioning & Breaking Changes**: The REST contract in
  `contracts/api.md` is the versioned interface between client and server;
  changes to it are breaking changes requiring a documented migration.
  ✅ PASS
- **Additional Constraints (no database)**: Sessions are JSON files under
  `data/sessions/`; concurrent access within a single process is serialized
  via an in-memory per-session write queue (see research.md) to prevent
  corruption. ✅ PASS

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-truth-or-dare/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
data/
└── sessions/
    └── <sessionId>.json     # one file per game session (created at runtime)

src/
├── content/                  # existing, from 002-seed-prompt-content
│   ├── promptLibrary.ts
│   └── types.ts
└── session/
    ├── types.ts               # Session, Player, Turn types
    ├── sessionStore.ts        # file-backed load/save + per-session write queue
    ├── sessionService.ts      # create/join/setRounds/chooseTruthOrDare/confirmTurn/expiry logic
    ├── sessionService.test.ts
    ├── httpApi.ts              # Express routes per contracts/api.md
    └── httpApi.test.ts

server.ts                      # thin entrypoint wiring httpApi onto an HTTP listener
```

**Structure Decision**: Single-project layout (Option 1), extending the
existing `src/` from `002-seed-prompt-content`. A new `src/session/` module
owns all session/turn state and exposes it over a small Express-based HTTP
API in `httpApi.ts`; `sessionService.ts` contains the pure game logic so it
can be unit-tested without spinning up HTTP.

## Complexity Tracking

> No constitution violations — table intentionally omitted.
