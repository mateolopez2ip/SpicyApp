import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadPool, getPrompt, type SessionQueue } from "./promptLibrary.ts";
import { PAIRINGS, PROMPT_TYPES } from "./types.ts";

const MIN_TONE_LENGTH = 15;

function makeTempPoolsRoot(pools: Record<string, Record<string, string[]>>) {
  const root = mkdtempSync(path.join(tmpdir(), "prompt-pools-"));
  for (const [pairing, types] of Object.entries(pools)) {
    for (const [type, prompts] of Object.entries(types)) {
      const dir = path.join(root, pairing);
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, `${type}.json`), JSON.stringify(prompts));
    }
  }
  return root;
}

describe("promptLibrary", () => {
  describe("loadPool", () => {
    it("reads a pool file and returns its prompt strings", () => {
      const root = makeTempPoolsRoot({
        "male-female": { truth: ["a", "b", "c", "d", "e", "f"] },
      });
      const prompts = loadPool("male-female", "truth", root);
      assert.deepEqual(prompts, ["a", "b", "c", "d", "e", "f"]);
    });

    it("throws when the pool file is missing", () => {
      const root = makeTempPoolsRoot({});
      assert.throws(() => loadPool("male-female", "truth", root));
    });

    it("throws when the pool has fewer than 6 prompts", () => {
      const root = makeTempPoolsRoot({
        "male-female": { truth: ["only", "two"] },
      });
      assert.throws(() => loadPool("male-female", "truth", root));
    });
  });

  describe("getPrompt", () => {
    let root: string;

    beforeEach(() => {
      root = makeTempPoolsRoot({
        "male-female": { truth: ["a", "b", "c", "d", "e", "f"] },
      });
    });

    it("never repeats a prompt within a session until the pool is exhausted, then reshuffles", () => {
      let queue: SessionQueue | undefined;
      const seen: string[] = [];

      for (let i = 0; i < 6; i++) {
        const result = getPrompt("male-female", "truth", queue, root);
        seen.push(result.prompt);
        queue = result.sessionQueue;
      }

      // All 6 unique prompts must have been returned exactly once.
      assert.deepEqual([...seen].sort(), ["a", "b", "c", "d", "e", "f"]);

      // A 7th call must reshuffle and keep returning valid prompts.
      const seventh = getPrompt("male-female", "truth", queue, root);
      assert.ok(["a", "b", "c", "d", "e", "f"].includes(seventh.prompt));
    });
  });

  describe("seed content tone (proxy for FR-004 tone review)", () => {
    for (const pairing of PAIRINGS) {
      for (const type of PROMPT_TYPES) {
        it(`every prompt in ${pairing}/${type} is non-empty and reasonably descriptive`, () => {
          const prompts = loadPool(pairing, type);
          for (const prompt of prompts) {
            assert.ok(prompt.trim().length >= MIN_TONE_LENGTH, `prompt too short: "${prompt}"`);
          }
        });
      }
    }
  });
});
