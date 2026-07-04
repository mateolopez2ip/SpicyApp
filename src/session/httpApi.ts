import express, { type Express, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createSession,
  joinSession,
  setRounds,
  getSession,
  chooseTruthOrDare,
  confirmTurn,
  restartSession,
  SessionError,
} from "./sessionService.ts";

function statusForError(err: SessionError): number {
  switch (err.code) {
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "FORBIDDEN":
      return 403;
    case "VALIDATION":
    default:
      return 400;
  }
}

function handle(res: Response, fn: () => unknown, successStatus = 200): void {
  try {
    const result = fn();
    res.status(successStatus).json(result);
  } catch (err) {
    if (err instanceof SessionError) {
      res.status(statusForError(err)).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Internal error" });
  }
}

const PUBLIC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
);

export function createHttpApi(): Express {
  const app = express();
  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  app.post("/sessions", (req: Request, res: Response) => {
    const { name, gender } = req.body ?? {};
    handle(res, () => createSession(name, gender), 201);
  });

  app.post("/sessions/:sessionId/join", (req: Request, res: Response) => {
    const { name, gender } = req.body ?? {};
    handle(res, () => joinSession(req.params.sessionId, name, gender));
  });

  app.post("/sessions/:sessionId/rounds", (req: Request, res: Response) => {
    const { roundCount } = req.body ?? {};
    handle(res, () => setRounds(req.params.sessionId, roundCount));
  });

  app.get("/sessions/:sessionId", (req: Request, res: Response) => {
    handle(res, () => getSession(req.params.sessionId));
  });

  app.post("/sessions/:sessionId/turn/choice", (req: Request, res: Response) => {
    const { playerId, choice } = req.body ?? {};
    handle(res, () => chooseTruthOrDare(req.params.sessionId, playerId, choice));
  });

  app.post("/sessions/:sessionId/turn/confirm", (req: Request, res: Response) => {
    const { playerId } = req.body ?? {};
    handle(res, () => confirmTurn(req.params.sessionId, playerId));
  });

  app.post("/sessions/:sessionId/restart", (req: Request, res: Response) => {
    handle(res, () => restartSession(req.params.sessionId));
  });

  return app;
}
