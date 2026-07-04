# Data Model: Rounds-Completed Counter

No new entities or persisted fields. This feature adds one pure
client-side function operating on the existing `SessionView`
(`001-truth-or-dare/contracts/api.md`).

## `computeRoundsCompleted(session)`

**Purpose**: Compute how many rounds have been fully confirmed so far.

**Input**: `session` — the last-polled `SessionView`, or `null` before any
session exists.

**Output**: a non-negative integer.

**Rules**:
- `session` is `null`, or `session.status === "waiting"` → `0`.
- `session.status === "in_progress"` → `session.currentRoundNumber - 1`.
- `session.status === "ended"` → `session.roundCount`.

## Amendment to `formatRoundProgress(session)` (from `003-game-web-ui`)

`formatRoundProgress` continues to produce the existing
`"Round X of Y"` label while a game is `in_progress` (unchanged from
`003-game-web-ui/contracts/ui-view-state.md`). This feature does not
change that label's wording — it adds the separate rounds-completed count
(FR-001) alongside it in the UI, and displays it on the end-of-game screen
where no round-progress label currently exists.
