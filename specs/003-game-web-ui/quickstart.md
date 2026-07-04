# Quickstart: Truth or Dare Web Game UI

## Prerequisites

- `001-truth-or-dare` implemented, including the `POST /sessions/:id/restart`
  extension from `contracts/api-extension.md`.
- Node.js 20 LTS; repository dependencies installed (`npm install`).

## Start the server

```sh
npx tsx server.ts
```

The static UI is served from the same server at `http://localhost:3000/`.

## Automated check — pure view-state logic

```sh
npm test -- viewState
```

**Expected outcome**: `public/viewState.test.js` passes, covering
`computeScreen`, `computeTurnControls`, and `formatRoundProgress` for every
session state named in contracts/ui-view-state.md (no session yet, waiting
for player 2, rounds form, turn — as both active and non-active player,
end of game).

## Manual browser walkthrough (User Stories 1-3 + Play again)

1. Open `http://localhost:3000/` in two separate browser windows/tabs
   (or two devices on the same network, replacing `localhost` with the
   server's address).
2. **Window A**: enter a name and gender, choose "Start a new game".
   **Expected**: a session number is shown, screen shows "waiting for the
   other player" (SC-001, User Story 1 scenario 1).
3. **Window B**: enter a name, gender, and the session number from Window
   A, choose "Join". **Expected**: Window A's screen updates automatically
   (no manual refresh) to show both players (User Story 1 scenario 5).
4. Either window: enter a round count (try an out-of-range value first to
   confirm inline validation, per FR-005/FR-013) and confirm.
   **Expected**: both windows move to the turn screen, showing the same
   round count and clearly indicating whose turn it is (User Story 1
   scenario 3, SC-002).
5. On the active player's window: choose "Truth" or "Dare". **Expected**:
   the resulting prompt appears on **both** windows within ~2 seconds
   without a manual refresh (User Story 2, SC-003); the choice buttons are
   not shown on the non-active window, and no "OK" button is shown on the
   active window until a choice is made.
6. On the non-active player's window: press "OK". **Expected**: both
   windows show the turn has passed to the other player and the round
   counter has advanced (User Story 3 scenario 1/3).
7. Repeat steps 5-6 until the configured round count is reached.
   **Expected**: both windows show a clear end-of-game screen (User Story
   3 scenario 4).
8. On either window, choose "Play again". **Expected**: both windows
   return to the round-count screen with the same two players already
   present (no re-entering name/gender/session number), per FR-011a/FR-011b.
9. Try joining with a made-up/expired session number. **Expected**: a
   clear, actionable error message (FR-012).

**Overall expected outcome**: all steps above complete without either
window ever showing a blank/stuck state, satisfying SC-004.
