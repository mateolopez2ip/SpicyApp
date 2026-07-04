# Feature Specification: Rounds-Completed Counter

**Feature Branch**: `004-rounds-completed-counter`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "añade en el front-end el contador de rondas realizadas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See How Many Rounds Have Been Played (Priority: P1)

While playing, and again once the game ends, a player wants to see how many
rounds have already been completed (not just the total agreed at the
start), so both players always know how far into the game they are.

**Why this priority**: This is a small, standalone visibility improvement
to the existing turn screen — it doesn't gate any other functionality, but
it directly improves players' sense of progress during a game, especially
in longer games.

**Independent Test**: Start a game with an agreed round count, play through
several turns, and confirm the displayed "rounds completed" count increases
by one each time a turn is confirmed, on both players' screens, and that
the end-of-game screen shows the final completed-rounds count.

**Acceptance Scenarios**:

1. **Given** a game has just started (no turn confirmed yet), **When**
   either player views the turn screen, **Then** the rounds-completed
   counter shows 0 completed rounds out of the agreed total.
2. **Given** a turn has just been confirmed, **When** either player's
   screen updates, **Then** the rounds-completed counter increases by
   exactly one on both screens.
3. **Given** the game has ended, **When** either player views the
   end-of-game screen, **Then** it shows the total number of rounds
   completed.
4. **Given** the two players' screens are polling independently, **When**
   a turn is confirmed on one screen, **Then** the counter updates
   automatically on the other screen without a manual refresh, within the
   same sync timing already guaranteed for turn/round updates.

---

### Edge Cases

- What happens right when the game starts, before any turn has been
  confirmed? The counter MUST show 0 completed rounds, not 1, and MUST
  NOT be blank or missing.
- What happens if the agreed round count is 1 (the shortest possible
  game)? The counter MUST correctly show 0 before the only round is
  confirmed, then 1 once it is confirmed and the game ends.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The UI MUST display, at all times during active gameplay, a
  clearly labeled count of how many rounds have been completed so far,
  distinct from the total agreed round count.
- **FR-002**: The rounds-completed count MUST start at 0 when a game
  begins and MUST increase by exactly one each time a turn is confirmed.
- **FR-003**: The rounds-completed count MUST update on both players'
  screens automatically, without requiring a manual refresh, within the
  same timing guarantees already established for turn/round sync.
- **FR-004**: The end-of-game screen MUST display the final
  rounds-completed count (equal to the agreed total once the game has
  ended normally).

### Key Entities

- **Rounds-Completed Count**: A number, derived from existing session/turn
  progress data, representing how many turns have been fully confirmed in
  the current game.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of turn confirmations result in the rounds-completed
  counter updating correctly (increasing by exactly one) on both players'
  screens.
- **SC-002**: Players can state how many rounds have been completed at any
  point in a game, and at its end, without needing to ask the other player
  or count manually.

## Assumptions

- This counter is a display-only addition to the existing turn and
  end-of-game screens; it introduces no new session/turn business rules —
  the underlying "how many rounds have been played" information already
  exists in the session data the UI already polls.
- "Rounds completed" is defined as the number of turns that have been
  confirmed (via the existing "OK" action), which is one less than the
  in-progress round number shown by the existing round-progress label
  while a game is still active, and equal to the agreed round count once
  the game has ended.
