# Quickstart: Seed Prompt Content Library

## Prerequisites

- Node.js 20 LTS installed.
- Repository checked out at branch `002-seed-prompt-content`.
- Seed content files present under `content/prompts/<pairing>/<type>.json`
  (see [data-model.md](./data-model.md) for the 6 expected files).

## Validate the pool files are well-formed

```sh
for f in content/prompts/*/*.json; do
  node -e "const a = require('./$f'); if (!Array.isArray(a) || a.length < 6) { console.error('FAIL: $f'); process.exit(1); } console.log('OK: $f (' + a.length + ' prompts)');"
done
```

**Expected outcome**: All 6 files print `OK: ... (N prompts)` with N ≥ 6.

## Validate selection behavior (per contracts/prompt-library.md)

Once `src/content/promptLibrary.ts` is implemented:

```sh
npm test -- promptLibrary
```

**Expected outcome**: Unit tests confirm:
1. `getPrompt` never returns the same prompt twice for a given
   `(pairing, type)` within a session until every prompt in that pool has
   been returned once (SC-003).
2. After exhausting a pool, the next call reshuffles and continues
   returning prompts rather than throwing or returning `undefined`.
3. Requesting a `(pairing, type)` with fewer than 6 prompts in its file
   throws a content-integrity error.

## Manual end-to-end check (ties back to User Story 1)

1. Start a game session for each of the three pairings
   (male-female, male-male, female-female) — via whatever entry point
   `001-truth-or-dare` exposes once implemented.
2. For each pairing, choose "Truth" and "Dare" repeatedly and confirm a
   prompt is always shown (never an empty/missing-content state) — SC-001.
3. Confirm the tone of shown prompts reads as flirtatious/sensual and not
   generic party-game content — SC-002 (manual/spot-check, not automatable).
