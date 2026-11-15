/** Mirrors backend `problem-fields.ts` for form hints only. */
export const PROBLEM_TITLE_MIN = 1;
export const PROBLEM_TITLE_MAX = 200;
export const PROBLEM_URL_MAX = 2048;
export const PROBLEM_NOTES_MAX = 10_000;
export const PROBLEM_PLATFORM_ID_MAX = 100;
export const PROBLEM_DIFFICULTY_MAX = 100;
export const PROBLEM_RATING_MIN = -10_000;
export const PROBLEM_RATING_MAX = 10_000_000;

export const PROBLEM_URL_HINT =
  "Use http or https. We trim spaces and ignore URL fragments; path and query are kept when checking duplicates.";