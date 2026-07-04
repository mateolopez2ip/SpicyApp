# Feature Specification: Truth or Dare Web Game UI

**Feature Branch**: `003-game-web-ui`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "Interfaz web para jugar a Verdad o Reto: pantallas para que cada jugador introduzca su nombre y sexo, cree o se una a una sesión mediante el número de sesión, acuerde el número de rondas, vea la elección de verdad/reto, vea la pregunta o acción, y pulse OK para confirmar el turno. Debe consumir la API REST ya existente en 001-truth-or-dare (crear sesión, unirse, fijar rondas, consultar estado, elegir, confirmar)."

## Clarifications

### Session 2026-07-04

- Q: What happens after the end-of-game screen? → A: End screen offers a "Play again" action that returns both players to the round-count step to start a new game with the same two players.
- Q: How does "Play again" technically re-coordinate the same two devices without manual re-sharing? → A: Extend `001-truth-or-dare`'s API with a restart action that resets an ended session back to `waiting`-for-rounds status, keeping the same session number/players, so both devices already polling that session number see it become playable again.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Up a Game From Two Devices (Priority: P1)

A player opens the web app, enters their name and gender, and either starts a
new game (getting a session number to share) or joins an existing game by
entering a session number someone shared with them. Once both players have
joined, they agree on a number of rounds on-screen and the game begins.

**Why this priority**: Without a working setup screen, players can never
reach the actual gameplay — this is the entry point for everything else.

**Independent Test**: Open the web app on two separate browser
tabs/devices, create a session on one, join it from the other using the
displayed session number, set a round count, and confirm both screens show
the game has started with the same players and round count.

**Acceptance Scenarios**:

1. **Given** a player opens the web app, **When** they enter their name and
   gender and choose "Start a new game", **Then** the screen displays a
   session number they can share with their partner.
2. **Given** a player has a session number, **When** they enter their name,
   gender, and that session number and choose "Join", **Then** their screen
   shows they've joined the same game as the other player.
3. **Given** both players have joined, **When** either one enters a number
   of rounds and confirms it, **Then** both screens transition to the game
   screen showing the same round count and whose turn it is.
4. **Given** a player enters a session number that doesn't exist or has
   expired, **When** they try to join, **Then** the screen shows a clear
   error message and lets them try again.
5. **Given** a player is on the "waiting for the other player" screen,
   **When** the other player joins, **Then** the waiting screen
   automatically updates to show both players without needing a manual
   refresh.

---

### User Story 2 - See the Turn's Truth Question or Dare Action (Priority: P1)

During a turn, the active player sees a choice between "Truth" and "Dare".
Once they pick one, both players' screens display the resulting question or
action, along with a clear indication of whose turn it is.

**Why this priority**: This is the moment-to-moment core of the game; without
it, players can set up a session but never actually play.

**Independent Test**: With a game already set up (from User Story 1), have
the active player choose Truth or Dare on their screen and confirm the
resulting prompt appears on both screens without a manual refresh.

**Acceptance Scenarios**:

1. **Given** it's a player's turn and no choice has been made yet, **When**
   they view their screen, **Then** they see "Truth" and "Dare" options to
   choose from.
2. **Given** the active player selects "Truth" or "Dare", **When** the
   selection completes, **Then** their screen shows the resulting question
   or action.
3. **Given** the active player has made their choice, **When** the other
   player's screen is viewed, **Then** it shows the same question or action
   and makes clear it is not their turn to act.
4. **Given** it is not a player's turn, **When** they view their screen,
   **Then** the "Truth"/"Dare" choice controls are not shown to them (only
   to the active player).

---

### User Story 3 - Confirm the Turn and See the Game Progress (Priority: P1)

After the active player has answered or performed the shown prompt, the
other player presses an "OK" button to confirm the turn is done. Both
screens then update to show whose turn it is next and the updated round
progress, until the game ends and an end-of-game screen is shown.

**Why this priority**: This closes the gameplay loop; without a way to
confirm and advance turns, a game started in User Story 1/2 can never
progress past the first turn.

**Independent Test**: With a Truth/Dare prompt already showing (from User
Story 2), press "OK" as the non-active player and confirm both screens
advance to the next player's turn, and that the round count visibly
updates.

**Acceptance Scenarios**:

1. **Given** a question or action is currently shown, **When** the
   non-active player presses "OK", **Then** both screens update to show it
   is now the other player's turn.
2. **Given** it is not their turn to confirm (i.e., they are the active
   player), **When** they view their screen, **Then** no "OK" confirmation
   control is shown to them.
3. **Given** the round progress is shown on screen, **When** a turn is
   confirmed, **Then** the displayed round number updates for both players.
4. **Given** the last round's turn is confirmed, **When** the screens
   update, **Then** both players see a clear end-of-game screen instead of
   another turn.
5. **Given** the end-of-game screen is shown, **When** either player
   chooses "Play again", **Then** both screens return to the round-count
   step so the same two players can start a new game together.

---

### Edge Cases

- What happens if a player's screen loses connection to the server
  temporarily? The screen MUST indicate the game is momentarily
  unreachable and automatically resume showing current game state once
  connectivity returns, without the player needing to re-enter their name,
  gender, or session number.
- What happens if a player tries to submit the name/gender/session-number
  form with missing or invalid input? The screen MUST show an inline
  validation message and prevent submission until corrected.
- What happens if a player closes the app mid-game and reopens it? Out of
  scope for this feature to persist a "return to my session" shortcut;
  the player can re-enter the same session number to resume viewing that
  session's current state.
- What happens if the round-count entry is outside the allowed range? The
  screen MUST show the allowed range and prevent submitting an invalid
  value.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The UI MUST let a player enter their name and gender before
  starting or joining a game.
- **FR-002**: The UI MUST let a player start a new game and clearly display
  the resulting session number so it can be shared with the other player.
- **FR-003**: The UI MUST let a player join an existing game by entering a
  session number, along with their name and gender.
- **FR-004**: The UI MUST show a waiting state to the first player until
  the second player has joined, updating automatically once they do.
- **FR-005**: The UI MUST let the two players agree on and submit a number
  of rounds before gameplay begins, showing the allowed range and
  rejecting out-of-range values before submission.
- **FR-006**: The UI MUST clearly indicate, at all times during gameplay,
  whose turn it currently is.
- **FR-007**: The UI MUST show the active player a choice between "Truth"
  and "Dare", and MUST NOT show this choice control to the non-active
  player.
- **FR-008**: The UI MUST display the resulting Truth question or Dare
  action to both players once the active player has chosen, updating the
  non-active player's screen without requiring a manual refresh.
- **FR-009**: The UI MUST show the non-active player an "OK" control to
  confirm the turn once a choice has been made, and MUST NOT show this
  control to the active player.
- **FR-010**: The UI MUST update both players' screens to reflect the new
  active player and updated round progress once a turn is confirmed,
  without requiring a manual refresh.
- **FR-011**: The UI MUST display a clear end-of-game screen to both
  players once the final round's turn has been confirmed.
- **FR-011a**: The end-of-game screen MUST offer a "Play again" action that
  returns both players to the round-count step (reusing the same session's
  two players) to start a new game without re-entering name/gender/session
  number.
- **FR-011b**: "Play again" MUST rely on the session being reset back to a
  rounds-not-yet-set state under the same session number, so both devices
  (already showing that session) transition together to the round-count
  step without either device needing to learn a new session number.
- **FR-012**: The UI MUST show a clear, actionable error message when a
  session number doesn't exist, has expired, or already has two players.
- **FR-013**: The UI MUST validate name, gender, session-number, and
  round-count input inline before allowing submission.

### Key Entities

- **Setup Form**: The name/gender (and, when joining, session-number) input
  a player fills in before entering a game.
- **Game Screen**: The player-facing view of the current session/turn
  state (whose turn, Truth/Dare choice or prompt, OK control, round
  progress), reflecting the session data already modeled in
  `001-truth-or-dare`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player can go from opening the app to completing
  session setup (name, gender, and create-or-join) in under 1 minute.
- **SC-002**: 95% of players can identify whose turn it is and what action
  they're expected to take (choose, wait, or confirm) without external
  help, on their first game.
- **SC-003**: Turn and round updates appear on the non-acting player's
  screen within 2 seconds of the acting player's action, matching the sync
  targets already defined in `001-truth-or-dare`.
- **SC-004**: 90% of players can complete a full game (setup through
  end-of-game screen) without encountering a UI state that leaves them
  unsure what to do next.

## Assumptions

- This feature is a web UI (not a native mobile app); "two devices" means
  two browser sessions, which may be two phones, two computers, or any
  combination.
- The UI is primarily a client of the existing `001-truth-or-dare` REST
  API, adding screens and client-side sync (polling) behavior; the one
  exception is the "Play again" restart capability (FR-011a/FR-011b), which
  requires a small addition to `001-truth-or-dare`'s session API (an action
  to reset an ended session back to a rounds-not-yet-set state under the
  same session number) — this is the only new backend behavior this
  feature depends on.
- Automatic screen updates (waiting-room, turn changes, prompt display)
  are achieved by the client periodically checking for updates; the exact
  interval is an implementation detail, not a user-facing requirement,
  as long as SC-003's 2-second target is met.
- A player is expected to keep the session number available (e.g., by
  reading it off their partner's screen or sharing it verbally/by
  message) to join a game; the app does not need to provide an automated
  sharing mechanism (e.g., QR code, link) for this feature.
- Visual/branding design (colors, exact layout, animations) is not
  specified here beyond the functional requirements above; those decisions
  are left to implementation as long as the functional requirements are
  met.
