# Quickstart: Truth or Dare Couples Game (Server)

## Prerequisites

- Node.js 20 LTS.
- `002-seed-prompt-content` implemented (provides `src/content/promptLibrary.ts`
  and the 6 seed pool files under `content/prompts/`).
- Repository at branch `001-truth-or-dare`; `data/sessions/` writable by the
  server process (created automatically on first write).

## Start the server

```sh
npm install
npm run build   # if compiling TS, or run directly via tsx per package.json
node server.js  # or: npx tsx server.ts
```

## Validate User Story 1 — coordinated session start (SC-001)

```sh
# Device A creates a session
curl -s -X POST http://localhost:3000/sessions \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alex","gender":"male"}'
# → { "sessionId": "ABC123", "session": { "status": "waiting", ... } }

# Device B joins with that sessionId
curl -s -X POST http://localhost:3000/sessions/ABC123/join \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sam","gender":"female"}'

# Either device sets the round count to start the game
curl -s -X POST http://localhost:3000/sessions/ABC123/rounds \
  -H 'Content-Type: application/json' \
  -d '{"roundCount":5}'
# → session.status is now "in_progress", activePlayerId is set
```

**Expected outcome**: both devices, via `GET /sessions/ABC123`, see the same
two players, the same `roundCount`, and the same randomly-chosen
`activePlayerId`.

## Validate User Story 2 — turn content sync (SC-002)

```sh
# The active player (use the playerId from the session state) chooses
curl -s -X POST http://localhost:3000/sessions/ABC123/turn/choice \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<activePlayerId>","choice":"truth"}'

# The other device polls and sees the same prompt
curl -s http://localhost:3000/sessions/ABC123
```

**Expected outcome**: `currentTurn.prompt` in the poll response matches
exactly what was set by the choice call, appearing within ~2s of polling.

## Validate User Story 3 — confirm and advance (SC-003)

```sh
# The non-active player confirms
curl -s -X POST http://localhost:3000/sessions/ABC123/turn/confirm \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<nonActivePlayerId>"}'
```

**Expected outcome**: subsequent `GET /sessions/ABC123` shows
`activePlayerId` swapped, `currentRoundNumber` incremented, and once
`currentRoundNumber` exceeds `roundCount`, `status` becomes `"ended"`.

## Automated tests

```sh
npm test -- session
```

**Expected outcome**: unit tests in `src/session/sessionService.test.ts`
cover the full state machine (create → join → set rounds → choose → confirm
→ round advance → end), the 15-minute unjoined-session expiry, the
non-active-player-only confirm rule, and the 2-player join cap — all without
needing to start an HTTP server.
