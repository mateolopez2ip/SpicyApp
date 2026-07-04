import type { PromptType } from "../content/types.ts";

export type Gender = "male" | "female";

export type SessionStatus = "waiting" | "in_progress" | "ended";

export type Choice = "truth" | "dare";

export interface Player {
  playerId: string;
  name: string;
  gender: Gender;
}

export interface Turn {
  activePlayerId: string;
  choice: Choice | null;
  prompt: string | null;
  confirmed: boolean;
}

/** Per-(promptType) remaining-prompts queue for this session, per 002-seed-prompt-content's SessionQueue. */
export type PromptQueues = Partial<Record<PromptType, string[]>>;

export interface Session {
  sessionId: string;
  status: SessionStatus;
  createdAt: string;
  players: Player[];
  roundCount: number | null;
  currentRoundNumber: number;
  activePlayerId: string | null;
  currentTurn: Turn | null;
  promptQueues: PromptQueues;
}

export interface SessionView {
  sessionId: string;
  status: SessionStatus;
  players: Player[];
  roundCount: number | null;
  currentRoundNumber: number;
  activePlayerId: string | null;
  currentTurn: Turn | null;
}

export function toSessionView(session: Session): SessionView {
  return {
    sessionId: session.sessionId,
    status: session.status,
    players: session.players,
    roundCount: session.roundCount,
    currentRoundNumber: session.currentRoundNumber,
    activePlayerId: session.activePlayerId,
    currentTurn: session.currentTurn,
  };
}
