import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Pairing, PromptType } from "./types.ts";

const DEFAULT_POOLS_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "content",
  "prompts",
);

const MIN_POOL_SIZE = 6;

export interface SessionQueue {
  remaining: string[];
}

export interface GetPromptResult {
  prompt: string;
  sessionQueue: SessionQueue;
}

function poolFilePath(pairing: Pairing, type: PromptType, poolsRoot: string): string {
  return path.join(poolsRoot, pairing, `${type}.json`);
}

/** Reads and validates one prompt pool file. Throws on missing/invalid/undersized content. */
export function loadPool(
  pairing: Pairing,
  type: PromptType,
  poolsRoot: string = DEFAULT_POOLS_ROOT,
): string[] {
  const filePath = poolFilePath(pairing, type, poolsRoot);

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(
      `Prompt pool file not found or unreadable: ${filePath}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Prompt pool file is not valid JSON: ${filePath}`);
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every((entry) => typeof entry === "string" && entry.length > 0)
  ) {
    throw new Error(
      `Prompt pool file must be a JSON array of non-empty strings: ${filePath}`,
    );
  }

  if (parsed.length < MIN_POOL_SIZE) {
    throw new Error(
      `Prompt pool at ${filePath} has ${parsed.length} prompts; at least ${MIN_POOL_SIZE} are required`,
    );
  }

  return parsed;
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Returns the next prompt for a turn, drawing from a shuffled per-session
 * queue so no prompt repeats until the whole pool has been used once, then
 * reshuffling and continuing.
 */
export function getPrompt(
  pairing: Pairing,
  type: PromptType,
  sessionQueue: SessionQueue | undefined,
  poolsRoot: string = DEFAULT_POOLS_ROOT,
): GetPromptResult {
  let remaining = sessionQueue?.remaining ?? [];

  if (remaining.length === 0) {
    const pool = loadPool(pairing, type, poolsRoot);
    remaining = shuffle(pool);
  }

  const [prompt, ...rest] = remaining;

  return {
    prompt,
    sessionQueue: { remaining: rest },
  };
}
