export function computeScreen(session) {
  if (!session) {
    return "setup";
  }
  if (session.status === "waiting") {
    return session.players.length < 2 ? "waiting_for_player" : "rounds_form";
  }
  if (session.status === "in_progress") {
    return "turn";
  }
  return "end_of_game";
}

export function computeTurnControls(session, myPlayerId) {
  const isMyTurn = session.activePlayerId === myPlayerId;
  const choiceMade = Boolean(session.currentTurn?.choice);

  return {
    showChoiceButtons: isMyTurn && !choiceMade,
    showOkButton: !isMyTurn && choiceMade,
  };
}

export function formatRoundProgress(session) {
  if (session.roundCount === null) {
    return "";
  }
  return `Round ${session.currentRoundNumber} of ${session.roundCount}`;
}

export function computeRoundsCompleted(session) {
  if (!session || session.status === "waiting") {
    return 0;
  }
  if (session.status === "ended") {
    return session.roundCount;
  }
  return session.currentRoundNumber - 1;
}
