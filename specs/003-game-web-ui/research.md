# Research: Truth or Dare Web Game UI

## Decision: No frontend framework or build step — plain HTML/CSS/JS

**Decision**: Build the client as static files (`index.html`, `styles.css`,
`viewState.js`, `app.js`) using native browser APIs (`fetch`, DOM), loaded
directly as ES modules with no bundler/transpiler.

**Rationale**: The app is 5 screens driven entirely by one small REST API
already defined in `001-truth-or-dare`. A framework (React/Vue/etc.) or
bundler (Vite/webpack) would add a build pipeline, dependency surface, and
learning overhead disproportionate to the actual complexity (Simplicity &
YAGNI). Serving static files from the existing Express app avoids a second
process/deployment target entirely.

**Alternatives considered**:
- *React/Vue + Vite*: rejected — a build step and component framework are
  unjustified for 5 screens with no complex client-side state beyond
  "what does the current session look like."
- *Server-rendered templates (e.g., EJS)*: rejected — this app's screens
  change based on client-side polling of session state, which fits a
  small client-side script better than repeated full-page server renders.

## Decision: Extract pure `viewState.js` for testability

**Decision**: All "given the current session JSON and my playerId, which
screen should be shown, and which controls (Truth/Dare buttons, OK button)
are visible" logic lives in plain functions in `public/viewState.js`, with
no DOM or `fetch` calls. `app.js` calls these functions and only handles
DOM updates and network calls.

**Rationale**: The constitution's Test-First principle applies here just as
it does to `001-truth-or-dare`'s `sessionService.ts`/`httpApi.ts` split:
pure logic is unit-tested; the thin adapter (DOM/network wiring) is
validated by the manual quickstart walkthrough instead of a headless-browser
test framework, which would be a disproportionate dependency for this
app's scale.

**Alternatives considered**:
- *Introducing a headless browser test runner (Playwright/Puppeteer)*:
  rejected for now — adds a heavy dependency to automate what a 2-minute
  manual quickstart check already covers at this project's size; can be
  reconsidered if the UI grows substantially.
- *No separation (logic inline in DOM handlers)*: rejected — would leave
  the screen-selection logic untested, violating Test-First.

## Decision: Extend `001-truth-or-dare` with `POST /sessions/:id/restart`

**Decision**: Add one new endpoint to the existing session API: it resets
an `ended` session back to `waiting`-with-both-players-already-present
(i.e., ready for a new `roundCount` to be set), keeping the same
`sessionId` and `players`.

**Rationale**: This feature's Clarifications session decided "Play again"
must work without either device learning a new session number — both are
already polling the same `sessionId`. The simplest way to achieve that is
for the *existing* session to become playable again, rather than inventing
an out-of-band way to communicate a new session number between two devices
that have no other communication channel in this app.

**Alternatives considered**:
- *Client creates a brand-new session and re-shares the number*: rejected
  by the Clarifications answer — would require an extra manual
  coordination step this feature is meant to avoid.
- *Keep full turn history and let the client "rewind"*: rejected — no
  requirement to preserve prior rounds' Q&A, and turn history isn't
  currently modeled in `001-truth-or-dare` (only the current turn is
  tracked); adding history would be unrequested scope.

## Decision: Polling interval — reuse ~1s, no new mechanism

**Decision**: `app.js` polls `GET /sessions/:id` every ~1 second, identical
to the interval `001-truth-or-dare`'s own research.md already settled on
for server-side sync targets.

**Rationale**: SC-003 in this spec restates the same 2-second target as
`001-truth-or-dare`'s SC-002/SC-003; reusing the same interval keeps the
whole system's sync behavior consistent and requires no new research.

**Alternatives considered**: See `001-truth-or-dare/research.md` (Decision:
Two-device sync via short-interval polling) — not re-litigated here.

## Resolved unknowns

All `NEEDS CLARIFICATION` markers from the Technical Context have been
resolved above; none remain.
