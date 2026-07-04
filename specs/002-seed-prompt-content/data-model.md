# Data Model: Seed Prompt Content Library

## Entities

### Prompt Pool

Represents one file: all prompts for a single (gender pairing × prompt
type) combination.

| Field | Type | Notes |
|---|---|---|
| `pairing` | enum: `male-female` \| `male-male` \| `female-female` | Matches the pairing rule defined in `001-truth-or-dare` FR-014. |
| `type` | enum: `truth` \| `dare` | |
| `prompts` | string[] | Ordered list of prompt texts; order has no semantic meaning (selection shuffles). Minimum length: 6 (FR-003). |

**Storage**: `content/prompts/<pairing>/<type>.json`, file contents are a
bare JSON array of strings (the `pairing`/`type` are implied by the file
path, not duplicated inside the file).

**Validation rules**:
- File MUST contain a JSON array of non-empty strings.
- Array MUST have at least 6 entries (FR-003).
- No two entries in the same pool should be exact duplicates (content
  quality, not a hard runtime check).

### Prompt

A single Truth question or Dare action string belonging to exactly one
Prompt Pool. No independent identity beyond its text and its pool
membership — prompts are not referenced by ID elsewhere in the system.

### Session Prompt Queue (runtime-only, not persisted to a new file)

Tracks, for a given game session and a given pool, which prompts have
already been shown so the no-repeat-until-exhausted rule (FR-005) can be
enforced.

| Field | Type | Notes |
|---|---|---|
| `pairing` | enum | Which pool this queue draws from. |
| `type` | enum | |
| `remaining` | string[] | Shuffled prompts not yet shown this "cycle"; when empty, refill by reshuffling the full pool. |

**Lifecycle**: Created lazily the first time a session requests a prompt
from a given (pairing, type) pool; lives for the lifetime of the game
session (owned by `001-truth-or-dare`'s existing per-session state, not a
new standalone file — this feature only supplies the pool data and the
selection function, not session persistence).

**State transitions**:
1. First request for (pairing, type) in a session → load full pool, shuffle
   → `remaining` = shuffled copy.
2. Each request → pop one prompt off `remaining`, return it.
3. When `remaining` becomes empty and another request arrives → reshuffle
   the full pool again → `remaining` = new shuffled copy → pop and return.
