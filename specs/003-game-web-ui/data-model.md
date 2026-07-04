# Data Model: Truth or Dare Web Game UI

This feature introduces no new persisted entities — it is a client of
`001-truth-or-dare`'s `Session`/`Player`/`Turn` model
(see `specs/001-truth-or-dare/data-model.md`). Two additions are needed:
one amendment to that existing model, and one new client-side (ephemeral,
unpersisted) concept.

## Amendment to `001-truth-or-dare`'s Session state machine

Per this feature's Clarifications, `Session.status` gains a transition that
didn't previously exist:

- `ended` → `waiting` (both players still present) — triggered by the new
  `POST /sessions/:id/restart` action (contracts/api-extension.md). On this
  transition: `roundCount` resets to `null`, `currentRoundNumber` resets to
  `0`, `activePlayerId` resets to `null`, `currentTurn` resets to `null`,
  and `promptQueues` reset to `{}` (a fresh game reuses the same seed
  content pools from the start). `players` are unchanged — no new
  join/name/gender entry is needed.

All other Session/Player/Turn fields and transitions are unchanged from
`001-truth-or-dare/data-model.md`.

## Client View State (ephemeral, not persisted)

Computed by `public/viewState.js` from the last-polled `SessionView` (see
`001-truth-or-dare/contracts/api.md`) plus the browser's own `myPlayerId`
(held in memory/`sessionStorage` for the duration of the tab, not sent to
or stored by the server as a new entity).

| Field | Derived from | Notes |
|---|---|---|
| `screen` | `session.status`, `session.players.length` | One of: `setup`, `waiting_for_player`, `rounds_form`, `turn`, `end_of_game`. |
| `isMyTurn` | `session.activePlayerId === myPlayerId` | Controls whether Truth/Dare choice controls are shown (FR-007). |
| `canConfirm` | `session.currentTurn?.choice` is set AND `!isMyTurn` | Controls whether the "OK" control is shown (FR-009). |
| `roundsRemainingLabel` | `session.currentRoundNumber`, `session.roundCount` | Human-readable "Round X of Y" text. |

This is recomputed on every poll tick; nothing here is written back to the
server except via the existing `001-truth-or-dare` actions (join, set
rounds, choose, confirm) and the new restart action.
