export type Pairing = "male-female" | "male-male" | "female-female";

export type PromptType = "truth" | "dare";

export const PAIRINGS: readonly Pairing[] = [
  "male-female",
  "male-male",
  "female-female",
];

export const PROMPT_TYPES: readonly PromptType[] = ["truth", "dare"];
