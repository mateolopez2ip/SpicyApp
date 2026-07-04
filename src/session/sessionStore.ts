import {
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Session } from "./types.ts";

const SESSIONS_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "data",
  "sessions",
);

function ensureSessionsDir(): void {
  if (!existsSync(SESSIONS_ROOT)) {
    mkdirSync(SESSIONS_ROOT, { recursive: true });
  }
}

function sessionFilePath(sessionId: string): string {
  return path.join(SESSIONS_ROOT, `${sessionId}.json`);
}

export function loadSession(sessionId: string): Session | undefined {
  const filePath = sessionFilePath(sessionId);
  if (!existsSync(filePath)) {
    return undefined;
  }
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Session;
}

/** Writes the session file atomically (write to temp file, then rename). */
export function saveSession(session: Session): void {
  ensureSessionsDir();
  const filePath = sessionFilePath(session.sessionId);
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tempPath, JSON.stringify(session, null, 2), "utf-8");
  renameSync(tempPath, filePath);
}

/** Deletes a session file if it exists (used for expiry and test cleanup). */
export function deleteSession(sessionId: string): void {
  const filePath = sessionFilePath(sessionId);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

// Serializes all mutations for a given sessionId within this process, so
// concurrent requests (e.g. both players acting near-simultaneously) never
// interleave a read-modify-write cycle.
const writeQueues = new Map<string, Promise<unknown>>();

/**
 * Runs `mutator` exclusively for this sessionId: no other queued mutation
 * for the same session runs concurrently with it.
 */
export function withSessionLock<T>(
  sessionId: string,
  mutator: () => T | Promise<T>,
): Promise<T> {
  const previous = writeQueues.get(sessionId) ?? Promise.resolve();
  const next = previous.then(mutator, mutator);
  // Swallow errors in the chain itself so one failed mutation doesn't
  // permanently wedge the queue for subsequent callers.
  writeQueues.set(
    sessionId,
    next.catch(() => undefined),
  );
  return next;
}
