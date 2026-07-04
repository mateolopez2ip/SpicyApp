import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  joinSession,
  setRounds,
  chooseTruthOrDare,
  confirmTurn,
  restartSession,
  SessionError,
} from "./sessionService.ts";
import { deleteSession } from "./sessionStore.ts";

const createdSessionIds: string[] = [];

function trackForCleanup(sessionId: string): string {
  createdSessionIds.push(sessionId);
  return sessionId;
}

after(() => {
  for (const id of createdSessionIds) {
    deleteSession(id);
  }
});

describe("sessionService", () => {
  describe("createSession", () => {
    it("creates a session with the first player and status waiting", () => {
      const { sessionId, session } = createSession("Alex", "male");
      trackForCleanup(sessionId);

      assert.equal(session.status, "waiting");
      assert.equal(session.players.length, 1);
      assert.equal(session.players[0].name, "Alex");
      assert.equal(session.players[0].gender, "male");
    });

    it("rejects an empty name", () => {
      assert.throws(() => createSession("", "male"), SessionError);
    });

    it("rejects an invalid gender", () => {
      // @ts-expect-error intentionally invalid input for the runtime check
      assert.throws(() => createSession("Alex", "other"), SessionError);
    });
  });

  describe("joinSession", () => {
    it("adds the second player and keeps status waiting until rounds are set", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);

      const { session } = joinSession(sessionId, "Sam", "female");

      assert.equal(session.players.length, 2);
      assert.equal(session.status, "waiting");
    });

    it("rejects joining an unknown sessionId", () => {
      assert.throws(() => joinSession("does-not-exist", "Sam", "female"), SessionError);
    });

    it("rejects joining a session that already has 2 players", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");

      assert.throws(() => joinSession(sessionId, "Jo", "female"), SessionError);
    });
  });

  describe("setRounds", () => {
    it("accepts a value between 1 and 20, starts the game, and randomly assigns activePlayerId", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");

      const { session } = setRounds(sessionId, 5);

      assert.equal(session.status, "in_progress");
      assert.equal(session.roundCount, 5);
      assert.equal(session.currentRoundNumber, 1);
      assert.ok(session.players.some((p) => p.playerId === session.activePlayerId));
    });

    it("rejects a round count outside 1-20", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");

      assert.throws(() => setRounds(sessionId, 0), SessionError);
      assert.throws(() => setRounds(sessionId, 21), SessionError);
    });

    it("rejects setting rounds before a second player has joined", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);

      assert.throws(() => setRounds(sessionId, 5), SessionError);
    });
  });

  describe("chooseTruthOrDare", () => {
    function startInProgressSession() {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");
      const { session } = setRounds(sessionId, 5);
      return { sessionId, activePlayerId: session.activePlayerId as string, session };
    }

    it("lets the active player choose truth or dare and sets a prompt", () => {
      const { sessionId, activePlayerId } = startInProgressSession();

      const { session } = chooseTruthOrDare(sessionId, activePlayerId, "truth");

      assert.equal(session.currentTurn?.choice, "truth");
      assert.ok(session.currentTurn?.prompt);
      assert.equal(session.currentTurn?.confirmed, false);
    });

    it("rejects a choice made by the non-active player", () => {
      const { sessionId, activePlayerId, session } = startInProgressSession();
      const otherPlayerId = session.players.find((p) => p.playerId !== activePlayerId)!.playerId;

      assert.throws(() => chooseTruthOrDare(sessionId, otherPlayerId, "dare"), SessionError);
    });

    it("rejects choosing again before the current turn is confirmed", () => {
      const { sessionId, activePlayerId } = startInProgressSession();
      chooseTruthOrDare(sessionId, activePlayerId, "truth");

      assert.throws(
        () => chooseTruthOrDare(sessionId, activePlayerId, "dare"),
        SessionError,
      );
    });
  });

  describe("confirmTurn", () => {
    function startTurnInProgress(roundCount = 2) {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");
      const { session: started } = setRounds(sessionId, roundCount);
      const activePlayerId = started.activePlayerId as string;
      const nonActivePlayerId = started.players.find(
        (p) => p.playerId !== activePlayerId,
      )!.playerId;
      chooseTruthOrDare(sessionId, activePlayerId, "truth");
      return { sessionId, activePlayerId, nonActivePlayerId };
    }

    it("advances the turn to the other player when the non-active player confirms", () => {
      const { sessionId, activePlayerId, nonActivePlayerId } = startTurnInProgress(5);

      const { session } = confirmTurn(sessionId, nonActivePlayerId);

      assert.equal(session.activePlayerId, nonActivePlayerId);
      assert.notEqual(session.activePlayerId, activePlayerId);
      assert.equal(session.currentRoundNumber, 2);
      assert.equal(session.currentTurn, null);
      assert.equal(session.status, "in_progress");
    });

    it("rejects confirmation attempted by the active player", () => {
      const { sessionId, activePlayerId } = startTurnInProgress(5);

      assert.throws(() => confirmTurn(sessionId, activePlayerId), SessionError);
    });

    it("rejects confirmation before a choice has been made", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");
      const { session } = setRounds(sessionId, 5);
      const nonActivePlayerId = session.players.find(
        (p) => p.playerId !== session.activePlayerId,
      )!.playerId;

      assert.throws(() => confirmTurn(sessionId, nonActivePlayerId), SessionError);
    });

    it("ends the game once the final round's turn is confirmed", () => {
      const { sessionId, nonActivePlayerId } = startTurnInProgress(1);

      const { session } = confirmTurn(sessionId, nonActivePlayerId);

      assert.equal(session.status, "ended");
    });
  });

  describe("restartSession", () => {
    it("resets an ended session back to waiting, keeping the same players", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");
      const { session: started } = setRounds(sessionId, 1);
      const nonActivePlayerId = started.players.find(
        (p) => p.playerId !== started.activePlayerId,
      )!.playerId;
      chooseTruthOrDare(sessionId, started.activePlayerId as string, "truth");
      confirmTurn(sessionId, nonActivePlayerId);

      const { session } = restartSession(sessionId);

      assert.equal(session.status, "waiting");
      assert.equal(session.roundCount, null);
      assert.equal(session.currentRoundNumber, 0);
      assert.equal(session.activePlayerId, null);
      assert.equal(session.currentTurn, null);
      assert.equal(session.players.length, 2);
    });

    it("rejects restarting a session that has not ended", () => {
      const { sessionId } = createSession("Alex", "male");
      trackForCleanup(sessionId);
      joinSession(sessionId, "Sam", "female");
      setRounds(sessionId, 5);

      assert.throws(() => restartSession(sessionId), SessionError);
    });
  });
});
