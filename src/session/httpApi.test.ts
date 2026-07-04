import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createHttpApi } from "./httpApi.ts";
import { deleteSession } from "./sessionStore.ts";

const createdSessionIds: string[] = [];
after(() => {
  for (const id of createdSessionIds) {
    deleteSession(id);
  }
});

function startServer() {
  const app = createHttpApi();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

describe("httpApi", () => {
  it("supports create -> join -> set rounds -> get, matching contracts/api.md", async () => {
    const { server, baseUrl } = startServer();
    try {
      const created = await postJson(`${baseUrl}/sessions`, {
        name: "Alex",
        gender: "male",
      });
      assert.equal(created.status, 201);
      const sessionId = created.body.sessionId as string;
      createdSessionIds.push(sessionId);

      const joined = await postJson(`${baseUrl}/sessions/${sessionId}/join`, {
        name: "Sam",
        gender: "female",
      });
      assert.equal(joined.status, 200);
      assert.equal(joined.body.session.players.length, 2);

      const rounds = await postJson(`${baseUrl}/sessions/${sessionId}/rounds`, {
        roundCount: 3,
      });
      assert.equal(rounds.status, 200);
      assert.equal(rounds.body.session.status, "in_progress");

      const got = await fetch(`${baseUrl}/sessions/${sessionId}`);
      assert.equal(got.status, 200);
      const gotBody = await got.json();
      assert.equal(gotBody.session.roundCount, 3);
    } finally {
      server.close();
    }
  });

  it("returns 404 for an unknown session", async () => {
    const { server, baseUrl } = startServer();
    try {
      const res = await fetch(`${baseUrl}/sessions/does-not-exist`);
      assert.equal(res.status, 404);
    } finally {
      server.close();
    }
  });

  it("supports choosing truth/dare via POST /sessions/:id/turn/choice", async () => {
    const { server, baseUrl } = startServer();
    try {
      const created = await postJson(`${baseUrl}/sessions`, {
        name: "Alex",
        gender: "male",
      });
      const sessionId = created.body.sessionId as string;
      createdSessionIds.push(sessionId);
      await postJson(`${baseUrl}/sessions/${sessionId}/join`, {
        name: "Sam",
        gender: "female",
      });
      const rounds = await postJson(`${baseUrl}/sessions/${sessionId}/rounds`, {
        roundCount: 3,
      });
      const activePlayerId = rounds.body.session.activePlayerId as string;

      const choice = await postJson(`${baseUrl}/sessions/${sessionId}/turn/choice`, {
        playerId: activePlayerId,
        choice: "dare",
      });

      assert.equal(choice.status, 200);
      assert.equal(choice.body.session.currentTurn.choice, "dare");
      assert.ok(choice.body.session.currentTurn.prompt);
    } finally {
      server.close();
    }
  });

  it("supports confirming a turn via POST /sessions/:id/turn/confirm", async () => {
    const { server, baseUrl } = startServer();
    try {
      const created = await postJson(`${baseUrl}/sessions`, {
        name: "Alex",
        gender: "male",
      });
      const sessionId = created.body.sessionId as string;
      createdSessionIds.push(sessionId);
      await postJson(`${baseUrl}/sessions/${sessionId}/join`, {
        name: "Sam",
        gender: "female",
      });
      const rounds = await postJson(`${baseUrl}/sessions/${sessionId}/rounds`, {
        roundCount: 2,
      });
      const activePlayerId = rounds.body.session.activePlayerId as string;
      const nonActivePlayerId = rounds.body.session.players.find(
        (p: { playerId: string }) => p.playerId !== activePlayerId,
      ).playerId as string;

      await postJson(`${baseUrl}/sessions/${sessionId}/turn/choice`, {
        playerId: activePlayerId,
        choice: "truth",
      });

      const confirm = await postJson(`${baseUrl}/sessions/${sessionId}/turn/confirm`, {
        playerId: nonActivePlayerId,
      });

      assert.equal(confirm.status, 200);
      assert.equal(confirm.body.session.activePlayerId, nonActivePlayerId);
      assert.equal(confirm.body.session.currentRoundNumber, 2);
    } finally {
      server.close();
    }
  });

  it("returns 409 when a third player tries to join", async () => {
    const { server, baseUrl } = startServer();
    try {
      const created = await postJson(`${baseUrl}/sessions`, {
        name: "Alex",
        gender: "male",
      });
      const sessionId = created.body.sessionId as string;
      createdSessionIds.push(sessionId);
      await postJson(`${baseUrl}/sessions/${sessionId}/join`, {
        name: "Sam",
        gender: "female",
      });

      const thirdJoin = await postJson(`${baseUrl}/sessions/${sessionId}/join`, {
        name: "Jo",
        gender: "female",
      });
      assert.equal(thirdJoin.status, 409);
    } finally {
      server.close();
    }
  });

  it("supports restarting an ended session via POST /sessions/:id/restart", async () => {
    const { server, baseUrl } = startServer();
    try {
      const created = await postJson(`${baseUrl}/sessions`, {
        name: "Alex",
        gender: "male",
      });
      const sessionId = created.body.sessionId as string;
      createdSessionIds.push(sessionId);
      await postJson(`${baseUrl}/sessions/${sessionId}/join`, {
        name: "Sam",
        gender: "female",
      });
      const rounds = await postJson(`${baseUrl}/sessions/${sessionId}/rounds`, {
        roundCount: 1,
      });
      const activePlayerId = rounds.body.session.activePlayerId as string;
      const nonActivePlayerId = rounds.body.session.players.find(
        (p: { playerId: string }) => p.playerId !== activePlayerId,
      ).playerId as string;
      await postJson(`${baseUrl}/sessions/${sessionId}/turn/choice`, {
        playerId: activePlayerId,
        choice: "truth",
      });
      await postJson(`${baseUrl}/sessions/${sessionId}/turn/confirm`, {
        playerId: nonActivePlayerId,
      });

      const restart = await postJson(`${baseUrl}/sessions/${sessionId}/restart`, {});

      assert.equal(restart.status, 200);
      assert.equal(restart.body.session.status, "waiting");
      assert.equal(restart.body.session.roundCount, null);
      assert.equal(restart.body.session.players.length, 2);
    } finally {
      server.close();
    }
  });

  it("returns 409 when restarting a session that has not ended", async () => {
    const { server, baseUrl } = startServer();
    try {
      const created = await postJson(`${baseUrl}/sessions`, {
        name: "Alex",
        gender: "male",
      });
      const sessionId = created.body.sessionId as string;
      createdSessionIds.push(sessionId);

      const restart = await postJson(`${baseUrl}/sessions/${sessionId}/restart`, {});
      assert.equal(restart.status, 409);
    } finally {
      server.close();
    }
  });
});
