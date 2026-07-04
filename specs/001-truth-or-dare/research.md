# Research: Truth or Dare Couples Game

## Decision: Two-device sync via short-interval polling, not WebSockets

**Decision**: Both devices poll a `GET /sessions/:id` endpoint on a short
interval (e.g., every ~1s) to observe session/turn state changes, rather
than using a WebSocket/SSE push channel.

**Rationale**: SC-002/SC-003 require updates to appear within 2 seconds —
easily met by 1s polling. Polling needs no new protocol, no connection
lifecycle/reconnect handling, and no extra dependency, which fits
Simplicity & YAGNI given this app's small scale (two clients per session).

**Alternatives considered**:
- *WebSockets (e.g., ws or socket.io)*: rejected for now — adds connection
  management, reconnect/backoff logic, and a new dependency to solve a
  timing requirement polling already satisfies at this scale.
- *Server-Sent Events*: rejected — still adds a persistent-connection
  lifecycle to manage (including the reconnect-and-recover requirement from
  the edge cases) for no benefit over polling here.

## Decision: File-backed session storage with an in-memory per-session write queue

**Decision**: Each session is one JSON file at
`data/sessions/<sessionId>.json`. All reads/writes for a given session go
through an in-memory queue (a promise chain keyed by `sessionId`) inside the
single Node process, so mutations (join, set rounds, choose, confirm) never
interleave and corrupt the file. Writes use write-to-temp-file-then-rename
for atomicity at the filesystem level.

**Rationale**: The constitution (v1.1.0) forbids a database. The main risk
of file-based state is two concurrent requests read-modifying-writing the
same file and one write clobbering the other (e.g., both players' devices
posting near-simultaneously per the "both press OK" edge case). A per-session
in-memory queue inside a single process fully serializes access with no
extra infrastructure (no lock files, no external coordination), satisfying
"account for concurrent read/write access... without corrupting data" from
the constitution's Additional Constraints.

**Alternatives considered**:
- *File locks (e.g., `proper-lockfile`)*: rejected — unnecessary complexity
  when the app runs as a single Node process; an in-memory queue achieves
  the same guarantee with zero new dependencies.
- *Database (any kind)*: excluded outright by the constitution.

## Decision: Lazy expiry for unjoined sessions (15 minutes)

**Decision**: A session's expiry is checked lazily: any read/join attempt on
a session still in "waiting for second player" status compares
`now - createdAt` against 15 minutes; if exceeded, it's treated as expired
(join rejected, session file deleted) without needing a background sweep.

**Rationale**: Matches the spec's actual requirement ("session number cannot
be joined indefinitely") with the simplest possible mechanism — no cron/
interval process needed (Simplicity & YAGNI). A background sweep to reclaim
disk space from abandoned session files can be added later if it becomes an
operational problem, but isn't required to satisfy the spec today.

**Alternatives considered**:
- *Background sweep/cron job deleting expired files periodically*: rejected
  for now — adds a second scheduled process for a problem (disk usage from
  abandoned files) not called out as a requirement; lazy expiry alone
  satisfies FR/edge-case behavior.

## Decision: Minimal HTTP framework (Express)

**Decision**: Use Express for routing or handling `req/res` for the
session/turn endpoints.

**Rationale**: Node's built-in `http` module would work but Express keeps
route/param handling and JSON body parsing simple and readable, and is a
well-understood, minimal-footprint default for a small REST API — one
dependency, no ORM/templating/other bundled features to strip out.

**Alternatives considered**:
- *Raw `node:http`*: rejected — would mean hand-rolling route matching and
  body parsing for marginal dependency savings.
- *A larger framework (NestJS, etc.)*: rejected — far more structure/
  conventions than this small API needs (Simplicity & YAGNI).

## Resolved unknowns

All `NEEDS CLARIFICATION` markers from the Technical Context have been
resolved above; none remain.
