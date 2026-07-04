import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeScreen,
  computeTurnControls,
  formatRoundProgress,
  computeRoundsCompleted,
} from "./viewState.js";

describe("viewState", () => {
  describe("computeScreen", () => {
    it("returns 'setup' when there is no session yet", () => {
      assert.equal(computeScreen(null), "setup");
    });

    it("returns 'waiting_for_player' when the session has only 1 player", () => {
      const session = { status: "waiting", players: [{ playerId: "1" }] };
      assert.equal(computeScreen(session), "waiting_for_player");
    });

    it("returns 'rounds_form' when the session is waiting with 2 players", () => {
      const session = {
        status: "waiting",
        players: [{ playerId: "1" }, { playerId: "2" }],
      };
      assert.equal(computeScreen(session), "rounds_form");
    });

    it("returns 'turn' when the session is in_progress", () => {
      const session = {
        status: "in_progress",
        players: [{ playerId: "1" }, { playerId: "2" }],
      };
      assert.equal(computeScreen(session), "turn");
    });

    it("returns 'end_of_game' when the session has ended", () => {
      const session = {
        status: "ended",
        players: [{ playerId: "1" }, { playerId: "2" }],
      };
      assert.equal(computeScreen(session), "end_of_game");
    });
  });

  describe("computeTurnControls", () => {
    it("shows choice buttons to the active player when no choice has been made", () => {
      const session = { activePlayerId: "1", currentTurn: null };
      assert.deepEqual(computeTurnControls(session, "1"), {
        showChoiceButtons: true,
        showOkButton: false,
      });
    });

    it("hides both controls from the active player once a choice has been made", () => {
      const session = {
        activePlayerId: "1",
        currentTurn: { choice: "truth", prompt: "..." },
      };
      assert.deepEqual(computeTurnControls(session, "1"), {
        showChoiceButtons: false,
        showOkButton: false,
      });
    });

    it("hides both controls from the non-active player before a choice is made", () => {
      const session = { activePlayerId: "1", currentTurn: null };
      assert.deepEqual(computeTurnControls(session, "2"), {
        showChoiceButtons: false,
        showOkButton: false,
      });
    });

    it("shows the OK button to the non-active player once a choice has been made", () => {
      const session = {
        activePlayerId: "1",
        currentTurn: { choice: "dare", prompt: "..." },
      };
      assert.deepEqual(computeTurnControls(session, "2"), {
        showChoiceButtons: false,
        showOkButton: true,
      });
    });
  });

  describe("formatRoundProgress", () => {
    it("formats the current round out of the total", () => {
      const session = { currentRoundNumber: 2, roundCount: 5 };
      assert.equal(formatRoundProgress(session), "Round 2 of 5");
    });

    it("returns an empty string when roundCount is null", () => {
      const session = { currentRoundNumber: 0, roundCount: null };
      assert.equal(formatRoundProgress(session), "");
    });
  });

  describe("computeRoundsCompleted", () => {
    it("returns 0 when there is no session yet", () => {
      assert.equal(computeRoundsCompleted(null), 0);
    });

    it("returns 0 when the session is still waiting", () => {
      const session = { status: "waiting", currentRoundNumber: 0, roundCount: null };
      assert.equal(computeRoundsCompleted(session), 0);
    });

    it("returns currentRoundNumber - 1 while the game is in progress", () => {
      const session = { status: "in_progress", currentRoundNumber: 3, roundCount: 5 };
      assert.equal(computeRoundsCompleted(session), 2);
    });

    it("returns roundCount once the game has ended", () => {
      const session = { status: "ended", currentRoundNumber: 3, roundCount: 3 };
      assert.equal(computeRoundsCompleted(session), 3);
    });
  });
});
