# Contract: Session/Turn REST API

Base path: `/sessions`. All bodies/responses are JSON. This is the contract
between the two players' client devices and the server; both devices call
the same endpoints.

## `POST /sessions`

Create a new session (User Story 1, FR-001, FR-003).

**Request body**: `{ name: string, gender: "male" | "female" }`

**Response 201**: `{ sessionId: string, session: SessionView }`

**Errors**: `400` if `name` is empty or `gender` isn't `"male"`/`"female"`.

## `POST /sessions/:sessionId/join`

Second player joins an existing session (User Story 1, FR-002, FR-003).

**Request body**: `{ name: string, gender: "male" | "female" }`

**Response 200**: `{ session: SessionView }`

**Errors**:
- `404` if `sessionId` doesn't exist or has expired (15-minute unjoined
  expiry).
- `409` if the session already has 2 players.

## `POST /sessions/:sessionId/rounds`

Set the agreed round count and start the game (User Story 1, FR-005,
FR-005a).

**Request body**: `{ roundCount: number }` (1-20 inclusive)

**Response 200**: `{ session: SessionView }` — `status` is now
`"in_progress"`, `activePlayerId` has been randomly chosen.

**Errors**: `400` if `roundCount` is out of range or the session doesn't yet
have 2 players; `404` if session not found.

## `GET /sessions/:sessionId`

Poll current session/turn state (both devices call this repeatedly to stay
in sync — see research.md's polling decision, and the reconnect-recovery
edge case).

**Response 200**: `{ session: SessionView }`

**Errors**: `404` if session not found/expired.

## `POST /sessions/:sessionId/turn/choice`

The active player chooses Truth or Dare (User Story 2, FR-006, FR-007,
FR-014).

**Request body**: `{ playerId: string, choice: "truth" | "dare" }`

**Response 200**: `{ session: SessionView }` — `currentTurn.choice` and
`currentTurn.prompt` are now set, visible to both devices via subsequent
`GET`.

**Errors**:
- `403` if `playerId` is not the current `activePlayerId`.
- `409` if a turn is already in progress (choice already made and not yet
  confirmed).
- `404` if session not found.

## `POST /sessions/:sessionId/turn/confirm`

The non-active player confirms the turn is complete (User Story 3, FR-010,
FR-011).

**Request body**: `{ playerId: string }`

**Response 200**: `{ session: SessionView }` — turn has advanced: the other
player is now `activePlayerId`, `currentRoundNumber` incremented,
`currentTurn` reset to null; OR, if the round count is now exceeded,
`status` is `"ended"`.

**Errors**:
- `403` if `playerId` is the current `activePlayerId` (only the *non-active*
  player may confirm — edge case: simultaneous action attempts).
- `409` if no `choice` has been made yet for the current turn.
- `404` if session not found.

## `SessionView` (shape returned by all endpoints above)

```json
{
  "sessionId": "string",
  "status": "waiting | in_progress | ended",
  "players": [{ "playerId": "string", "name": "string", "gender": "male | female" }],
  "roundCount": "number | null",
  "currentRoundNumber": "number",
  "activePlayerId": "string | null",
  "currentTurn": {
    "activePlayerId": "string",
    "choice": "truth | dare | null",
    "prompt": "string | null",
    "confirmed": "boolean"
  }
}
```
