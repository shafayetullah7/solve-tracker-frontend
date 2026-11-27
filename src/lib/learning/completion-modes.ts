/** Mirrors backend `learningNodeCompletionMode` (SPA does not import schema modules). */
export const completionMode = {
  Structural: "structural",
  Manual: "manual",
  Gated: "gated",
} as const;

export type CompletionMode = (typeof completionMode)[keyof typeof completionMode];

export const writableCompletionModes = [
  completionMode.Structural,
  completionMode.Manual,
] as const;

export type WritableCompletionMode = (typeof writableCompletionModes)[number];