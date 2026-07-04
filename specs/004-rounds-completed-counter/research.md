# Research: Rounds-Completed Counter

## Decision: Derive rounds-completed from existing fields, no new backend data

**Decision**: `computeRoundsCompleted(session)` computes the count purely
from `session.status`, `session.currentRoundNumber`, and
`session.roundCount` — all already present in the `SessionView` the client
already polls (per `001-truth-or-dare/contracts/api.md`).

**Rationale**: Per `001-truth-or-dare/data-model.md`, `currentRoundNumber`
represents the round currently in progress (1-indexed), incrementing only
on turn confirmation, and the session transitions to `"ended"` exactly when
the last round's turn is confirmed. This means:
- While `status === "in_progress"`: rounds completed = `currentRoundNumber - 1`
  (the current round hasn't been confirmed yet).
- While `status === "ended"`: rounds completed = `roundCount` (every round
  was confirmed to reach the end).
- Before a game starts (`status === "waiting"`): rounds completed = `0`.

No new field, endpoint, or session state is needed — adding one would
duplicate information the backend already tracks (violates Simplicity &
YAGNI and the constitution's "no database"/minimal-state spirit).

**Alternatives considered**:
- *Add a dedicated `roundsCompleted` field to the Session/SessionView
  model*: rejected — redundant with data already present; would need to be
  kept in sync in two places for no benefit.
- *Track rounds completed client-side by counting poll transitions*:
  rejected — fragile (a missed poll tick or a page reload would lose the
  count); deriving from server state is authoritative and always correct.

## Resolved unknowns

None — no `NEEDS CLARIFICATION` markers were present in the Technical
Context; this is a small, fully-specified addition to existing code.
