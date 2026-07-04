# Contract: `001-truth-or-dare` API Extension — Session Restart

This adds one endpoint to the REST API documented in
`specs/001-truth-or-dare/contracts/api.md`. It is additive/backward
compatible — no existing endpoint's request/response shape changes.

## `POST /sessions/:sessionId/restart`

Resets an `ended` session back to a rounds-not-yet-set state so the same
two players can play again without re-sharing a session number (User Story
3, FR-011a/FR-011b).

**Request body**: none required.

**Response 200**: `{ session: SessionView }` — `status` is now `"waiting"`,
`roundCount` is `null`, `currentRoundNumber` is `0`, `activePlayerId` is
`null`, `currentTurn` is `null`. `players` are unchanged.

**Errors**:
- `409` if the session's `status` is not `"ended"` (restart only applies to
  a finished game).
- `404` if the session doesn't exist (or has separately expired/been
  deleted).

Both players' clients, already polling `GET /sessions/:sessionId`, observe
this state change on their next poll and (per `viewState.js`) transition
to the round-count screen automatically.
