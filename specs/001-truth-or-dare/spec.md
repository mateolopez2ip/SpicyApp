# Feature Specification: Truth or Dare Couples Game

**Feature Branch**: `001-truth-or-dare`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "la aplicación ha de pedir el nombre de dos usuarios, pidiendo el sexo de cada uno de ellos. tiene que haber un número de sesión, porque la aplicación la tendrán dos personas en dos dispositivos diferentes y deben estar coordinados. Luego, por turnos, uno decidirá si quiere verdad o reto. Dependiendo de lo que decida, le aparecerá una pregunta a la que contestar, o una acción que realizar. Esta pregunta o acción le aparecerá a las dos personas. Una vez realizada la acción o contestada la pregunta por la persona con el turno, el otro deberá pulsar un OK para dar por bueno el turno, y pasará a el. Al inicio del juego se decidirá entre ambos el número de rondas a realizar"

## Clarifications

### Session 2026-07-04

- Q: Who takes the first turn when a game starts? → A: Chosen randomly by the app when the game starts.
- Q: How should gender selection map to the content shown? → A: Binary Male/Female selection only; content pool is chosen based on the pairing (male-female, male-male, female-female).
- Q: What are the allowed bounds for the number of rounds? → A: Between 1 and 20 rounds.
- Q: How should the app handle a player reconnecting mid-turn after a dropped connection? → A: Session state is persisted centrally; on reconnect, the device just re-fetches and displays the current turn state automatically.
- Q: How long should an unjoined session remain open before its session number expires? → A: 15 minutes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Coordinated Session Across Two Devices (Priority: P1)

Two players, each on their own device, want to play the same game together. One
player creates a new game session and receives a session number; the other
player enters that session number on their device to join the same game. Both
players enter their name and gender, and together agree on the number of
rounds before the game begins.

**Why this priority**: Without reliable session coordination, the two devices
cannot play the same game at all — this is the foundation the rest of the
feature depends on.

**Independent Test**: Can be fully tested by creating a session on one device,
joining it from a second device using the session number, and confirming both
devices show the same two player names/genders and the same round count once
both players are ready.

**Acceptance Scenarios**:

1. **Given** a player opens the app on device A, **When** they choose to start
   a new game and enter their name and gender, **Then** the app generates a
   unique session number and displays it to them.
2. **Given** a session number generated on device A, **When** a second player
   enters that session number, their name, and their gender on device B,
   **Then** device B joins the same session and both devices recognize both
   players.
3. **Given** both players have joined the same session, **When** they agree on
   and enter a number of rounds, **Then** both devices display the same round
   count and the game becomes ready to start, with the app randomly selecting
   which player takes the first turn.
4. **Given** a player enters a session number that does not exist or has
   already ended, **When** they attempt to join, **Then** the app shows a
   clear error message and does not start a game.

---

### User Story 2 - Take a Turn Choosing Truth or Dare (Priority: P1)

During their turn, a player chooses between "Truth" or "Dare". Based on that
choice, a question (Truth) or an action (Dare) is shown, and it appears
simultaneously on both players' devices so both can follow along.

**Why this priority**: This is the core gameplay loop; without it there is no
game, only session setup.

**Independent Test**: Can be fully tested by taking a turn, selecting Truth or
Dare, and confirming the resulting question or action appears identically on
both devices at the same time.

**Acceptance Scenarios**:

1. **Given** it is a player's turn, **When** they select "Truth", **Then** a
   question is shown on their device and the same question appears on the
   other player's device.
2. **Given** it is a player's turn, **When** they select "Dare", **Then** an
   action/challenge is shown on their device and the same action appears on
   the other player's device.
3. **Given** a question or action is currently displayed, **When** the other
   player's device is checked, **Then** it shows the identical content the
   active player is seeing, with a clear indication of whose turn it is.

---

### User Story 3 - Confirm the Turn and Advance to the Next Player (Priority: P1)

After the active player answers the question or performs the action, the
other player confirms it was done by pressing an "OK" button. Once confirmed,
the turn passes to the other player, and the round/turn counter advances
accordingly until the agreed number of rounds is reached.

**Why this priority**: This closes the turn loop and drives the game from
start to finish; without it the game cannot progress past the first turn.

**Independent Test**: Can be fully tested by completing a Truth or Dare
prompt, having the non-active player press "OK", and confirming the turn
switches to the other player and the round count updates on both devices.

**Acceptance Scenarios**:

1. **Given** the active player has answered a question or performed a dare,
   **When** the other player presses "OK", **Then** the turn passes to that
   other player on both devices.
2. **Given** the turn has just passed to a new player, **When** that player's
   device is viewed, **Then** it shows the Truth/Dare choice screen for their
   turn.
3. **Given** the configured number of rounds has been completed, **When** the
   last turn is confirmed with "OK", **Then** both devices show that the game
   has ended.

---

### Edge Cases

- What happens if the session-creating player's device loses connection or
  closes the app before the second player joins? The session MUST expire
  15 minutes after creation if no second player has joined, so the session
  number cannot be joined indefinitely.
- What happens if the non-active player closes the app or loses connection
  while a Truth/Dare prompt is active? The game MUST persist the current
  turn's state centrally so that, when the player's device reconnects, it
  automatically re-fetches and displays the current turn state (question/
  action, whose turn, choice made) without requiring the turn to be skipped
  or restarted.
- What happens if a player tries to join a session that already has two
  players? The app MUST reject the join attempt with a clear message.
- What happens if both players attempt to press "OK" or otherwise act at the
  same time (e.g., the active player also tries to advance the turn)? Only
  the non-active player's confirmation MUST be able to advance the turn.
- What happens when the last round finishes? The app MUST clearly present an
  end-of-game state on both devices rather than silently stopping.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST allow a player to create a new game session and
  receive a unique session number that identifies that session.
- **FR-002**: The app MUST allow a second player to join an existing game
  session by entering that session's number.
- **FR-003**: The app MUST collect a name and a gender (Male or Female) for
  each of the two players before the game starts.
- **FR-004**: The app MUST prevent more than two players from joining the
  same session.
- **FR-005**: The app MUST allow the two players to jointly agree on and set
  the number of rounds for the game before it begins, choosing a value
  between 1 and 20 rounds inclusive.
- **FR-005a**: The app MUST randomly select which of the two players takes
  the first turn once the round count is set and the game starts.
- **FR-006**: The app MUST allow the player whose turn it is to choose
  between "Truth" and "Dare".
- **FR-007**: When "Truth" is chosen, the app MUST display a question to
  both players; when "Dare" is chosen, the app MUST display an action/
  challenge to both players.
- **FR-008**: The app MUST display the same Truth question or Dare action
  simultaneously and identically on both players' devices.
- **FR-009**: The app MUST clearly indicate on both devices whose turn it
  currently is and what the active player chose (Truth or Dare).
- **FR-010**: The app MUST require the non-active player to confirm
  completion of the current turn (via an "OK" action) before the turn
  advances to the other player.
- **FR-011**: The app MUST advance the turn to the other player only after
  the non-active player's confirmation is received.
- **FR-012**: The app MUST track progress toward the agreed number of rounds
  and end the game once that number is reached.
- **FR-013**: The app MUST present a clear end-of-game state to both players
  once the agreed number of rounds is complete.
- **FR-014**: The app MUST select Truth questions and Dare actions from a
  content pool matching the gender pairing of the two players (male-female,
  male-male, or female-female).

### Key Entities

- **Session**: Represents one game being played by two coordinated devices.
  Has a unique session number, a status (waiting for second player, in
  progress, ended), an agreed round count, and a current turn state.
- **Player**: Represents one of the two participants in a session. Has a
  name, a gender, and a role (whose turn it currently is).
- **Turn**: Represents a single round exchange — which player is active,
  whether they chose Truth or Dare, the specific question or action shown,
  and whether the other player has confirmed it as complete.
- **Prompt (Question/Action)**: Represents a single Truth question or Dare
  action available to be shown during a turn.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Two players on two separate devices can create and join the
  same game session in under 1 minute.
- **SC-002**: 100% of Truth questions and Dare actions shown during a turn
  appear identically on both devices within 2 seconds of being generated.
- **SC-003**: Turns advance to the correct next player within 2 seconds of
  the confirming player's "OK" action, in at least 99% of turns.
- **SC-004**: Players can complete an entire game, from session creation to
  end-of-game screen, without needing to restart the session due to
  synchronization errors, in at least 95% of played games.
- **SC-005**: 90% of first-time users successfully create or join a session
  and complete their first turn without external help.

## Assumptions

- Each game session supports exactly two players; group play is out of
  scope for this feature.
- The session number is used only to coordinate the two devices for a single
  game and is not a persistent user account identifier.
- Gender is collected as a binary Male/Female category to tailor the
  tone/content of Truth questions and Dare actions based on the pairing, not
  for any other profiling purpose.
- Players are physically together or otherwise able to see each other
  perform Dare actions; the app itself does not verify that a Dare was
  actually completed — it relies on the other player's honest confirmation.
- A reasonable library of Truth questions and Dare actions, appropriate for
  an adult couples audience, is available/maintained as app content; content
  authoring/moderation is out of scope for this specification.
- Network connectivity between the two devices is required for the entire
  game session; offline/local-only play is out of scope.
- If a session is abandoned before the second player joins, it MUST expire
  15 minutes after creation so the session number cannot be reused
  indefinitely.
