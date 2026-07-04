# Data Model: Truth or Dare Couples Game

## Entities

### Session

Persisted as `data/sessions/<sessionId>.json`.

| Field | Type | Notes |
|---|---|---|
| `sessionId` | string | Unique, generated on creation (e.g., short random code). |
| `status` | `"waiting" \| "in_progress" \| "ended"` | `waiting` until player 2 joins; `in_progress` once rounds are set; `ended` once round count is reached. |
| `createdAt` | ISO timestamp | Used for the 15-minute unjoined-session expiry (FR/edge case). |
| `players` | `[Player]` or `[Player, Player]` | Starts with 1 player (creator), gains the 2nd on join. Never more than 2 (FR-004). |
| `roundCount` | number \| null | Set once, 1-20 inclusive (FR-005); null before both players agree on it. |
| `currentRoundNumber` | number | Starts at 1 once the game starts; increments on each confirmed turn. |
| `activePlayerId` | string \| null | Which player's turn it is; chosen randomly when the game starts (FR-005a). |
| `currentTurn` | Turn \| null | The in-progress turn, if any. |

**Validation rules**:
- `players.length` MUST NOT exceed 2 (FR-004).
- `roundCount`, once set, MUST be between 1 and 20 inclusive (FR-005).
- A session with `status: "waiting"` and `now - createdAt > 15 minutes` MUST
  be treated as expired (rejected on join, eligible for deletion).

**State transitions**:
1. `waiting` (1 player) → `waiting` (2 players, after join) — still waiting
   on `roundCount`.
2. `waiting` (2 players) → `in_progress` — once `roundCount` is set;
   `activePlayerId` is chosen randomly and `currentRoundNumber` = 1.
3. `in_progress` → `in_progress` — after each confirmed turn:
   `activePlayerId` swaps to the other player; `currentRoundNumber`
   increments; `currentTurn` resets to null until the new active player
   chooses Truth/Dare.
4. `in_progress` → `ended` — when a confirmed turn would push
   `currentRoundNumber` past `roundCount`.

### Player

Embedded within Session (not a separate file).

| Field | Type | Notes |
|---|---|---|
| `playerId` | string | Unique within the session (e.g., "1"/"2" or a generated id). |
| `name` | string | Collected at session creation/join (FR-003). |
| `gender` | `"male" \| "female"` | Binary selection (FR-003, spec Clarifications). |

**Derived**: The session's gender **pairing** (`male-female` \| `male-male`
\| `female-female`, per `002-seed-prompt-content`) is computed from the two
players' `gender` values once both have joined — it is not stored
separately.

### Turn

Embedded within Session as `currentTurn` (not a separate file/history log —
the spec only requires tracking the *current* turn's state, not full turn
history).

| Field | Type | Notes |
|---|---|---|
| `activePlayerId` | string | Which player this turn belongs to (mirrors `Session.activePlayerId` while the turn is open). |
| `choice` | `"truth" \| "dare" \| null` | Null until the active player picks. |
| `prompt` | string \| null | Set once `choice` is made, drawn via `getPrompt` from `002-seed-prompt-content` for the session's gender pairing. |
| `confirmed` | boolean | Set true when the non-active player presses "OK" (FR-010/FR-011); triggers the turn-advance state transition. |

### Prompt Session Queue (per session, per pairing/type — reused from 002)

Not a new file — `Session` additionally stores the `SessionQueue` state (see
`002-seed-prompt-content/data-model.md`) needed by `getPrompt`, scoped to
this session, e.g. a small map keyed by `"truth"`/`"dare"` holding each
`remaining` array. This travels inside the session's JSON file since it's
part of that session's state.
