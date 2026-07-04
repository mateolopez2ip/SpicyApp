# Quickstart: Rounds-Completed Counter

## Prerequisites

- `001-truth-or-dare` and `003-game-web-ui` implemented and running
  (`npx tsx server.ts`).

## Automated check

```sh
npm test -- viewState
```

**Expected outcome**: `public/viewState.test.js` passes, covering
`computeRoundsCompleted()` for `waiting` (0), `in_progress` at various
round numbers (`currentRoundNumber - 1`), and `ended` (`roundCount`).

## Manual browser walkthrough

1. Open two tabs at `http://localhost:3000/`, set up a game with
   `roundCount = 3`.
2. On the turn screen, confirm the rounds-completed counter shows `0`
   before any turn is confirmed.
3. Complete a turn (choose + confirm). **Expected**: the counter shows `1`
   on both tabs.
4. Repeat until the game ends. **Expected**: after the 3rd confirmation,
   the end-of-game screen shows `3` rounds completed.
