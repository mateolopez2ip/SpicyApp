# Contract: Prompt Library Module

This is the internal contract the `001-truth-or-dare` feature (or any other
future caller) uses to consume seed content. It is a function-call contract
(in-process module), not a network API — this feature has no HTTP surface of
its own.

## `getPrompt(pairing, type, sessionQueue)`

**Purpose**: Return the next prompt to show for a turn, enforcing
no-repeat-within-session-until-exhausted (FR-005).

**Inputs**:
- `pairing`: `"male-female" | "male-male" | "female-female"`
- `type`: `"truth" | "dare"`
- `sessionQueue`: the caller-owned Session Prompt Queue state for this
  `(pairing, type)` combination (see data-model.md); `undefined`/absent on
  first call for that combination.

**Output**:
- `{ prompt: string, sessionQueue: <updated queue state> }`

**Behavior**:
1. If `sessionQueue` is absent or empty, load the pool file for
   `(pairing, type)`, shuffle it, and use that as the new queue.
2. Pop and return one prompt from the front of the queue.
3. Return the updated queue alongside the prompt so the caller can persist
   it as part of its own session state.

**Errors**:
- Throws if the pool file for `(pairing, type)` is missing, unreadable, or
  contains fewer than 6 entries — this is a content-integrity error that
  should never occur with the shipped seed content and indicates a
  deployment/content problem.

## `loadPool(pairing, type)`

**Purpose**: Read and parse one pool file.

**Inputs**: `pairing`, `type` as above.

**Output**: `string[]` — the raw list of prompts in that pool.

**Errors**: Throws if the file doesn't exist or isn't valid JSON, or isn't
an array of at least 6 non-empty strings.
