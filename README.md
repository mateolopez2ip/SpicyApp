# SpicyApp

## Seed prompt content

Truth and Dare prompts live as plain JSON files (no database, per the
project constitution) under:

```text
content/prompts/<pairing>/<type>.json
```

Where `<pairing>` is one of `male-female`, `male-male`, `female-female`, and
`<type>` is `truth` or `dare`. Each file is a JSON array of prompt strings,
e.g.:

```json
["¿Cuál es la fantasía que más te gustaría cumplir conmigo?", "..."]
```

### Adding more prompts

To grow a pool, just append more non-empty strings to the relevant array —
no code changes are needed. Each pool must keep at least 6 prompts;
`loadPool()` (in `src/content/promptLibrary.ts`) throws if a pool file is
missing, invalid JSON, or has fewer than 6 entries.

### Reading prompts in code

`src/content/promptLibrary.ts` exposes:

- `loadPool(pairing, type)` — reads and validates one pool file.
- `getPrompt(pairing, type, sessionQueue)` — returns the next prompt for a
  turn, shuffling per session and never repeating a prompt until the whole
  pool has been used once (see `specs/002-seed-prompt-content/contracts/prompt-library.md`).

## Session/Turn API (Truth or Dare game)

Two players coordinate a game across two devices via a session number. All
session/turn state is stored as one JSON file per session under
`data/sessions/<sessionId>.json` (no database, per the project
constitution), guarded by an in-memory per-session write queue
(`src/session/sessionStore.ts`) so concurrent requests never corrupt a
session file. Both devices poll `GET /sessions/:id` to stay in sync.

Full contract: [`specs/001-truth-or-dare/contracts/api.md`](specs/001-truth-or-dare/contracts/api.md).

| Method & Path | Purpose |
|---|---|
| `POST /sessions` | Create a session with the first player's name/gender; returns a `sessionId`. |
| `POST /sessions/:id/join` | Second player joins with their name/gender. |
| `POST /sessions/:id/rounds` | Agree on a round count (1-20); starts the game and randomly picks who goes first. |
| `GET /sessions/:id` | Poll the current session/turn state. |
| `POST /sessions/:id/turn/choice` | The active player picks `"truth"` or `"dare"`; a prompt is drawn from the seed content library. |
| `POST /sessions/:id/turn/confirm` | The non-active player confirms the turn; play advances, or the game ends once the round count is reached. |
| `POST /sessions/:id/restart` | Resets an *ended* session back to the round-count step (same session number/players), used by the web UI's "Play again" action. |

### Running the server

```sh
npm install
npx tsx server.ts   # or: npm run build && node dist/server.js
```

`PORT` (default `3000`) selects the listening port.

## Web UI

Open `http://localhost:<PORT>/` (default `http://localhost:3000/`) in a
browser after starting the server above. It's a static, dependency-free
client (`public/index.html`, `public/styles.css`, `public/app.js`,
`public/viewState.js` — no framework or build step) served by the same
Express server, which walks two players through the whole game:

1. Enter your name and gender, then either **"Crear partida"** (start a new
   session) or enter a session number and **"Unirse"** (join one).
2. The creator sees a session number to share with the other player; the
   waiting screen updates automatically once they join.
3. Either player sets the number of rounds (1-20) to start the game.
4. On their turn, the active player picks **Verdad** (Truth) or **Reto**
   (Dare); the resulting prompt appears on both screens.
5. The other player presses **OK** to confirm the turn and advance play.
   The turn screen shows a "Rondas completadas" counter that updates on
   both screens as turns are confirmed.
6. After the final round, both screens show an end screen with the final
   rounds-completed count and **"Jugar otra vez"** to restart the same
   session from the round-count step.

To play locally with two "players," open two browser tabs/windows pointed
at the same URL. See `specs/003-game-web-ui/quickstart.md` for a detailed
walkthrough.

## Development

```sh
npm install
npm test    # runs unit tests (node:test via tsx)
npm run lint
```
