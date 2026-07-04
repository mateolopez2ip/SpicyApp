import { randomBytes } from "node:crypto";
import type { Gender, Session, Choice } from "./types.ts";
import { toSessionView } from "./types.ts";
import { loadSession, saveSession, deleteSession } from "./sessionStore.ts";
import { getPrompt } from "../content/promptLibrary.ts";
import type { Pairing } from "../content/types.ts";

const MIN_ROUNDS = 1;
const MAX_ROUNDS = 20;
const UNJOINED_EXPIRY_MS = 15 * 60 * 1000;

export type SessionErrorCode = "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "FORBIDDEN";

export class SessionError extends Error {
  code: SessionErrorCode;

  constructor(code: SessionErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "SessionError";
  }
}

function isValidGender(value: unknown): value is Gender {
  return value === "male" || value === "female";
}

function assertValidPlayerInput(name: string, gender: Gender): void {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new SessionError("VALIDATION", "Player name must be a non-empty string");
  }
  if (!isValidGender(gender)) {
    throw new SessionError("VALIDATION", 'Gender must be "male" or "female"');
  }
}

function generateSessionId(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

function loadActiveSession(sessionId: string): Session {
  const session = loadSession(sessionId);
  if (!session) {
    throw new SessionError("NOT_FOUND", `Session not found: ${sessionId}`);
  }

  if (
    session.status === "waiting" &&
    session.players.length < 2 &&
    Date.now() - Date.parse(session.createdAt) > UNJOINED_EXPIRY_MS
  ) {
    deleteSession(sessionId);
    throw new SessionError("NOT_FOUND", `Session expired: ${sessionId}`);
  }

  return session;
}

export function createSession(name: string, gender: Gender) {
  assertValidPlayerInput(name, gender);

  const session: Session = {
    sessionId: generateSessionId(),
    status: "waiting",
    createdAt: new Date().toISOString(),
    players: [{ playerId: "1", name, gender }],
    roundCount: null,
    currentRoundNumber: 0,
    activePlayerId: null,
    currentTurn: null,
    promptQueues: {},
  };

  saveSession(session);
  return { sessionId: session.sessionId, session: toSessionView(session) };
}

export function joinSession(sessionId: string, name: string, gender: Gender) {
  assertValidPlayerInput(name, gender);
  const session = loadActiveSession(sessionId);

  if (session.players.length >= 2) {
    throw new SessionError("CONFLICT", `Session already has 2 players: ${sessionId}`);
  }

  session.players.push({ playerId: "2", name, gender });
  saveSession(session);
  return { session: toSessionView(session) };
}

export function setRounds(sessionId: string, roundCount: number) {
  const session = loadActiveSession(sessionId);

  if (session.players.length < 2) {
    throw new SessionError(
      "VALIDATION",
      "Cannot set rounds until a second player has joined",
    );
  }
  if (!Number.isInteger(roundCount) || roundCount < MIN_ROUNDS || roundCount > MAX_ROUNDS) {
    throw new SessionError(
      "VALIDATION",
      `roundCount must be an integer between ${MIN_ROUNDS} and ${MAX_ROUNDS}`,
    );
  }

  session.roundCount = roundCount;
  session.status = "in_progress";
  session.currentRoundNumber = 1;
  session.activePlayerId =
    session.players[Math.floor(Math.random() * session.players.length)].playerId;

  saveSession(session);
  return { session: toSessionView(session) };
}

function genderPairing(session: Session): Pairing {
  const genders = session.players.map((p) => p.gender).sort();
  if (genders[0] === "male" && genders[1] === "male") return "male-male";
  if (genders[0] === "female" && genders[1] === "female") return "female-female";
  return "male-female";
}

export function chooseTruthOrDare(sessionId: string, playerId: string, choice: Choice) {
  const session = loadActiveSession(sessionId);

  if (session.activePlayerId !== playerId) {
    throw new SessionError(
      "FORBIDDEN",
      "Only the active player may choose Truth or Dare this turn",
    );
  }
  if (session.currentTurn && session.currentTurn.choice) {
    throw new SessionError(
      "CONFLICT",
      "A choice has already been made for the current turn",
    );
  }

  const pairing = genderPairing(session);
  const existingQueue = session.promptQueues[choice];
  const { prompt, sessionQueue } = getPrompt(
    pairing,
    choice,
    existingQueue ? { remaining: existingQueue } : undefined,
  );
  session.promptQueues[choice] = sessionQueue.remaining;

  session.currentTurn = {
    activePlayerId: playerId,
    choice,
    prompt,
    confirmed: false,
  };

  saveSession(session);
  return { session: toSessionView(session) };
}

export function confirmTurn(sessionId: string, playerId: string) {
  const session = loadActiveSession(sessionId);

  if (session.activePlayerId === playerId) {
    throw new SessionError(
      "FORBIDDEN",
      "The active player cannot confirm their own turn; only the other player can",
    );
  }
  if (!session.currentTurn || !session.currentTurn.choice) {
    throw new SessionError(
      "CONFLICT",
      "No choice has been made for the current turn yet",
    );
  }

  const nextPlayer = session.players.find((p) => p.playerId === playerId);
  if (!nextPlayer) {
    throw new SessionError("FORBIDDEN", "playerId does not belong to this session");
  }

  session.activePlayerId = playerId;
  session.currentTurn = null;

  if (session.currentRoundNumber >= (session.roundCount ?? 0)) {
    session.status = "ended";
  } else {
    session.currentRoundNumber += 1;
  }

  saveSession(session);
  return { session: toSessionView(session) };
}

export function getSession(sessionId: string) {
  const session = loadActiveSession(sessionId);
  return { session: toSessionView(session) };
}

export function restartSession(sessionId: string) {
  const session = loadActiveSession(sessionId);

  if (session.status !== "ended") {
    throw new SessionError(
      "CONFLICT",
      "Only an ended session can be restarted",
    );
  }

  session.status = "waiting";
  session.roundCount = null;
  session.currentRoundNumber = 0;
  session.activePlayerId = null;
  session.currentTurn = null;
  session.promptQueues = {};

  saveSession(session);
  return { session: toSessionView(session) };
}
