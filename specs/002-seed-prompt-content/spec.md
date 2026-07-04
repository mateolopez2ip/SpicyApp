# Feature Specification: Seed Prompt Content Library

**Feature Branch**: `002-seed-prompt-content`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "genera una lista de retos y preguntas previa, todas ellas han de tener cierto caracter sensual y sexual"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Game With a Ready-Made Content Library (Priority: P1)

As two players starting a Truth or Dare game (see the `001-truth-or-dare`
feature), we want the app to already contain a starter set of Truth questions
and Dare actions with a sensual/flirtatious tone, matched to our gender
pairing, so that we can start playing immediately without having to write our
own prompts first.

**Why this priority**: The turn-taking gameplay (`001-truth-or-dare`) is
useless without actual content to show during a turn; this feature supplies
that content.

**Independent Test**: Can be fully tested by starting a game for each of the
three supported gender pairings (male-female, male-male, female-female) and
confirming that both Truth questions and Dare actions are available and are
drawn from the seed library without repeating before the pool is exhausted.

**Acceptance Scenarios**:

1. **Given** a new game session for a given gender pairing, **When** a player
   selects "Truth", **Then** a question from that pairing's seed Truth pool is
   shown.
2. **Given** a new game session for a given gender pairing, **When** a player
   selects "Dare", **Then** an action from that pairing's seed Dare pool is
   shown.
3. **Given** a game session in progress, **When** multiple Truth or Dare
   prompts have been shown, **Then** no prompt already used in that session is
   shown again until every prompt in the relevant pool has been used at least
   once.

---

### User Story 2 - Consistent Sensual Tone Across All Seed Content (Priority: P2)

As a player, I want every seed Truth question and Dare action to carry a
similar, consistently flirtatious/sensual tone — not a mix of completely
innocent party-game content and explicit content — so the game feels coherent
and matches the app's intended experience.

**Why this priority**: Inconsistent tone (e.g., some prompts childish, others
far more explicit than others) breaks the experience and could surprise or
mismatch player expectations set by the app.

**Independent Test**: Can be tested by sampling prompts from each pairing's
pool and confirming each one is suggestive/flirtatious in tone, phrased for
consenting adult partners, and none reads as purely innocuous party-game
content nor as graphic/explicit content.

**Acceptance Scenarios**:

1. **Given** the full seed library, **When** any Truth question is reviewed,
   **Then** it invites a flirtatious, personal, or intimate disclosure between
   the two partners (not a neutral icebreaker question).
2. **Given** the full seed library, **When** any Dare action is reviewed,
   **Then** it invites a flirtatious or sensual physical action between the
   two partners that is safe and reasonable to perform in a private setting.

---

### Edge Cases

- What happens if a session's round count exceeds the number of unique
  prompts available in a pool? Once every prompt in a pool has been shown
  once, the pool MUST reshuffle and reuse prompts rather than erroring out or
  running out of content.
- What happens if the two players are of a gender pairing not covered by the
  seed pools (e.g., a player declines to specify, if ever allowed)? Out of
  scope for this feature — `001-truth-or-dare` currently limits gender to a
  Male/Female binary selection, so only the three pairings above exist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a seed library of Truth questions and
  Dare actions, organized into pools by gender pairing: male-female,
  male-male, and female-female, matching the pairing rule already defined in
  `001-truth-or-dare`.
- **FR-002**: Each of the three pairing pools MUST contain a Truth sub-pool
  and a Dare sub-pool.
- **FR-003**: Each Truth and Dare sub-pool MUST contain at least 6 distinct
  prompts at initial launch.
- **FR-004**: Every prompt in the seed library MUST have a sensual/
  flirtatious tone appropriate for consenting adult partners, and MUST NOT be
  purely innocuous/neutral party-game content nor graphically explicit
  content.
- **FR-005**: The system MUST be able to select a prompt from the
  appropriate sub-pool during a turn (per `001-truth-or-dare` FR-006/FR-007)
  without showing the same prompt twice in a session until the whole
  sub-pool has been used at least once.
- **FR-006**: The seed content MUST be stored as files on the server,
  consistent with the project's no-database constraint.

### Key Entities

- **Prompt Pool**: A named collection of prompts for one gender pairing
  (male-female, male-male, female-female) and one prompt type (Truth or
  Dare).
- **Prompt**: A single Truth question or Dare action belonging to exactly one
  Prompt Pool, with its display text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For each of the 3 gender pairings, players can play a complete
  game of up to 6 rounds choosing either Truth or Dare every round without
  ever seeing an empty or missing-content state.
- **SC-002**: 100% of seed prompts reviewed match a consistent
  sensual/flirtatious tone (no purely neutral or graphically explicit
  outliers).
- **SC-003**: No prompt repeats within a single game session before every
  prompt in its pool has been shown at least once.

## Assumptions

- The three gender pairings and the binary Male/Female player gender model
  are inherited from `001-truth-or-dare` and not redefined here.
- "Sensual/sexual character" means flirtatious, suggestive, and intimate in
  tone and is written to be tasteful (not graphically explicit), consistent
  with an app intended for private use between consenting adult partners.
- Six prompts per sub-pool is a minimum starter set; the content library is
  expected to grow over time without requiring a new specification each time
  (adding more prompts to existing pools is a content update, not a new
  feature).
- Dare actions are physical/behavioral suggestions that two partners can
  safely perform in a private setting; nothing requiring props, third
  parties, or unsafe activity is in scope.

## Sample Seed Content

The following is the initial seed list satisfying FR-001 through FR-004
(6 Truth + 6 Dare per pairing, 36 prompts total). Additional prompts can be
added to these pools later as a content update.

### Male-Female

**Truth**
1. ¿Cuál es la fantasía que más te gustaría cumplir conmigo?
2. ¿Qué prenda mía te resulta más atractiva y por qué?
3. Describe el momento en que te sentiste más atraído/a por mí.
4. ¿Qué parte de mi cuerpo te gusta más?
5. ¿Cuál ha sido el lugar más atrevido en el que has pensado que podríamos estar juntos?
6. Si pudieras elegir una noche entera solo para nosotros, ¿cómo la planearías?

**Dare**
1. Susúrrame al oído algo que te gustaría que hiciera esta noche.
2. Dame un beso en el cuello durante 10 segundos.
3. Quítame una prenda de ropa, la que tú elijas.
4. Baila de forma sensual para mí durante 30 segundos.
5. Hazme un masaje en los hombros durante un minuto.
6. Mírame a los ojos y describe en voz alta lo que te gustaría hacerme.

### Male-Male

**Truth**
1. ¿Qué es lo que más te excita de mí?
2. Describe el momento en que sentiste más deseo por mí.
3. ¿Qué fantasía te gustaría explorar conmigo?
4. ¿Qué parte de mi cuerpo te resulta más atractiva?
5. ¿Cuál ha sido el momento más atrevido que has imaginado entre los dos?
6. Si tuviéramos una noche solo para nosotros, ¿qué harías primero?

**Dare**
1. Susúrrame algo provocador al oído.
2. Dame un beso lento en el cuello.
3. Quítame una prenda de ropa, la que prefieras.
4. Baila de forma sensual para mí durante 30 segundos.
5. Dame un masaje en los hombros durante un minuto.
6. Mírame fijamente y dime qué te gustaría hacerme ahora mismo.

### Female-Female

**Truth**
1. ¿Qué es lo que más te atrae de mí?
2. Describe el momento en que sentiste más deseo por mí.
3. ¿Qué fantasía te gustaría cumplir conmigo?
4. ¿Qué parte de mi cuerpo te gusta más?
5. ¿Cuál ha sido la situación más atrevida que has imaginado entre las dos?
6. Si tuviéramos una noche solo para nosotras, ¿cómo la empezarías?

**Dare**
1. Susúrrame algo provocador al oído.
2. Dame un beso suave en el cuello.
3. Quítame una prenda de ropa, la que tú elijas.
4. Baila de forma sensual para mí durante 30 segundos.
5. Dame un masaje en los hombros durante un minuto.
6. Mírame a los ojos y dime qué te gustaría hacerme ahora.
