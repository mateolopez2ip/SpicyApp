import {
  computeScreen,
  computeTurnControls,
  formatRoundProgress,
  computeRoundsCompleted,
} from "./viewState.js";

const API_BASE = "";

async function apiRequest(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

function createSession(name, gender) {
  return apiRequest("POST", "/sessions", { name, gender });
}

function joinSession(sessionId, name, gender) {
  return apiRequest("POST", `/sessions/${sessionId}/join`, { name, gender });
}

function setRounds(sessionId, roundCount) {
  return apiRequest("POST", `/sessions/${sessionId}/rounds`, { roundCount });
}

function getSession(sessionId) {
  return apiRequest("GET", `/sessions/${sessionId}`);
}

function chooseTruthOrDare(sessionId, playerId, choice) {
  return apiRequest("POST", `/sessions/${sessionId}/turn/choice`, { playerId, choice });
}

function confirmTurn(sessionId, playerId) {
  return apiRequest("POST", `/sessions/${sessionId}/turn/confirm`, { playerId });
}

function restartSession(sessionId) {
  return apiRequest("POST", `/sessions/${sessionId}/restart`, {});
}

// --- State & DOM wiring -----------------------------------------------

const POLL_INTERVAL_MS = 1000;

const state = {
  sessionId: sessionStorage.getItem("sessionId"),
  myPlayerId: sessionStorage.getItem("myPlayerId"),
  session: null,
  pollTimer: null,
};

const el = {
  errorBanner: document.getElementById("error-banner"),
  screens: {
    setup: document.getElementById("screen-setup"),
    waiting_for_player: document.getElementById("screen-waiting_for_player"),
    rounds_form: document.getElementById("screen-rounds_form"),
    turn: document.getElementById("screen-turn"),
    end_of_game: document.getElementById("screen-end_of_game"),
  },
  setupForm: document.getElementById("setup-form"),
  setupName: document.getElementById("setup-name"),
  setupGender: document.getElementById("setup-gender"),
  setupSessionId: document.getElementById("setup-session-id"),
  setupError: document.getElementById("setup-error"),
  waitingSessionId: document.getElementById("waiting-session-id"),
  roundsForm: document.getElementById("rounds-form"),
  roundsCount: document.getElementById("rounds-count"),
  roundsError: document.getElementById("rounds-error"),
  roundProgress: document.getElementById("round-progress"),
  roundsCompleted: document.getElementById("rounds-completed"),
  turnIndicator: document.getElementById("turn-indicator"),
  choiceButtons: document.getElementById("choice-buttons"),
  promptText: document.getElementById("prompt-text"),
  okButtonContainer: document.getElementById("ok-button-container"),
  okButton: document.getElementById("ok-button"),
  playAgainButton: document.getElementById("play-again-button"),
  finalRoundsCompleted: document.getElementById("final-rounds-completed"),
};

function showError(message) {
  el.errorBanner.textContent = message;
  el.errorBanner.hidden = false;
}

function clearError() {
  el.errorBanner.hidden = true;
  el.errorBanner.textContent = "";
}

function persistIdentity(sessionId, myPlayerId) {
  state.sessionId = sessionId;
  state.myPlayerId = myPlayerId;
  sessionStorage.setItem("sessionId", sessionId);
  sessionStorage.setItem("myPlayerId", myPlayerId);
}

function render() {
  const screenName = computeScreen(state.session);

  for (const [name, sectionEl] of Object.entries(el.screens)) {
    sectionEl.hidden = name !== screenName;
  }

  if (screenName === "waiting_for_player") {
    el.waitingSessionId.textContent = state.sessionId;
  }

  if (screenName === "turn") {
    const session = state.session;
    el.roundProgress.textContent = formatRoundProgress(session);
    el.roundsCompleted.textContent = `Rondas completadas: ${computeRoundsCompleted(session)}`;
    const isMyTurn = session.activePlayerId === state.myPlayerId;
    el.turnIndicator.textContent = isMyTurn
      ? "Es tu turno"
      : "Turno del otro jugador";

    const { showChoiceButtons, showOkButton } = computeTurnControls(
      session,
      state.myPlayerId,
    );
    el.choiceButtons.hidden = !showChoiceButtons;
    el.okButtonContainer.hidden = !showOkButton;

    if (session.currentTurn && session.currentTurn.prompt) {
      el.promptText.hidden = false;
      el.promptText.textContent = session.currentTurn.prompt;
    } else {
      el.promptText.hidden = true;
      el.promptText.textContent = "";
    }
  }

  if (screenName === "end_of_game") {
    el.finalRoundsCompleted.textContent = `Rondas completadas: ${computeRoundsCompleted(state.session)}`;
  }
}

async function pollOnce() {
  if (!state.sessionId) return;
  try {
    const { session } = await getSession(state.sessionId);
    state.session = session;
    clearError();
    render();
  } catch (err) {
    showError(err.message);
    if (err.status === 404) {
      stopPolling();
      sessionStorage.removeItem("sessionId");
      sessionStorage.removeItem("myPlayerId");
      state.sessionId = null;
      state.myPlayerId = null;
      state.session = null;
      render();
    }
  }
}

function startPolling() {
  if (state.pollTimer) return;
  pollOnce();
  state.pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
}

el.setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  el.setupError.hidden = true;

  const name = el.setupName.value.trim();
  const gender = el.setupGender.value;
  const sessionId = el.setupSessionId.value.trim();
  const action = event.submitter?.dataset.action;

  if (!name) {
    el.setupError.textContent = "Introduce tu nombre.";
    el.setupError.hidden = false;
    return;
  }
  if (action === "join" && !sessionId) {
    el.setupError.textContent = "Introduce el número de sesión para unirte.";
    el.setupError.hidden = false;
    return;
  }

  try {
    if (action === "create") {
      const result = await createSession(name, gender);
      persistIdentity(result.sessionId, result.session.players[0].playerId);
    } else {
      const result = await joinSession(sessionId, name, gender);
      const me = result.session.players[result.session.players.length - 1];
      persistIdentity(sessionId, me.playerId);
    }
    startPolling();
  } catch (err) {
    el.setupError.textContent = err.message;
    el.setupError.hidden = false;
  }
});

el.roundsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  el.roundsError.hidden = true;

  const roundCount = Number(el.roundsCount.value);
  if (!Number.isInteger(roundCount) || roundCount < 1 || roundCount > 20) {
    el.roundsError.textContent = "Elige un número de rondas entre 1 y 20.";
    el.roundsError.hidden = false;
    return;
  }

  try {
    await setRounds(state.sessionId, roundCount);
  } catch (err) {
    el.roundsError.textContent = err.message;
    el.roundsError.hidden = false;
  }
});

el.choiceButtons.addEventListener("click", async (event) => {
  const choice = event.target.dataset.choice;
  if (!choice) return;
  try {
    await chooseTruthOrDare(state.sessionId, state.myPlayerId, choice);
  } catch (err) {
    showError(err.message);
  }
});

el.okButton.addEventListener("click", async () => {
  try {
    await confirmTurn(state.sessionId, state.myPlayerId);
  } catch (err) {
    showError(err.message);
  }
});

el.playAgainButton.addEventListener("click", async () => {
  try {
    await restartSession(state.sessionId);
  } catch (err) {
    showError(err.message);
  }
});

if (state.sessionId && state.myPlayerId) {
  startPolling();
} else {
  render();
}
