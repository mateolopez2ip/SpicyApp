# Contract: `viewState.js` (client-side pure logic)

This is the "UI contract" for this feature — the pure-function boundary
`app.js` (DOM wiring) relies on, and what `viewState.test.js` tests
directly.

## `computeScreen(session)`

**Purpose**: Decide which of the 5 screens to show (FR-001 through FR-013
collectively depend on this).

**Inputs**:
- `session`: the last-polled `SessionView` (or `null` before any session
  exists yet), per `001-truth-or-dare/contracts/api.md`. Screen selection
  depends only on `session.status` and `session.players.length`, not on
  which player is viewing.

**Output**: one of `"setup" | "waiting_for_player" | "rounds_form" | "turn" | "end_of_game"`

**Rules**:
- `session` is `null` → `"setup"`.
- `session.status === "waiting"` and `session.players.length < 2` →
  `"waiting_for_player"`.
- `session.status === "waiting"` and `session.players.length === 2` →
  `"rounds_form"`.
- `session.status === "in_progress"` → `"turn"`.
- `session.status === "ended"` → `"end_of_game"`.

## `computeTurnControls(session, myPlayerId)`

**Purpose**: Decide which controls are visible on the `"turn"` screen
(FR-007, FR-009).

**Output**: `{ showChoiceButtons: boolean, showOkButton: boolean }`

**Rules**:
- `showChoiceButtons` is true only if `session.activePlayerId === myPlayerId`
  and `session.currentTurn?.choice` is not set.
- `showOkButton` is true only if `session.activePlayerId !== myPlayerId`
  and `session.currentTurn?.choice` is set.

## `formatRoundProgress(session)`

**Purpose**: Produce the human-readable round-progress label.

**Output**: a string like `"Round 2 of 5"`, or `""` if `roundCount` is
`null`.
