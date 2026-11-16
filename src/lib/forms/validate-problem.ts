import type { FieldErrors } from "./field-errors";
import {
  PROBLEM_DIFFICULTY_MAX,
  PROBLEM_NOTES_MAX,
  PROBLEM_PLATFORM_ID_MAX,
  PROBLEM_RATING_MAX,
  PROBLEM_RATING_MIN,
  PROBLEM_TITLE_MAX,
  PROBLEM_TITLE_MIN,
  PROBLEM_URL_MAX,
} from "../problems/fields";
import { codePointLength } from "./unicode";

export const PROBLEM_MSG = {
  titleEmpty: "Problem title must not be empty.",
  titleTooLong: `Problem title must contain at most ${PROBLEM_TITLE_MAX} characters.`,
  urlEmpty: "Problem URL must not be empty.",
  urlTooLong: `Problem URL must contain at most ${PROBLEM_URL_MAX} characters.`,
  urlInvalid: "Problem URL is not valid.",
  urlScheme: "Problem URL must use http or https.",
  atMost: (max: number) => `At most ${max} characters.`,
  ratingInvalid: `Rating must be a whole number between ${PROBLEM_RATING_MIN.toLocaleString()} and ${PROBLEM_RATING_MAX.toLocaleString()}.`,
} as const;

function atMostCodePoints(value: string, max: number): string | undefined {
  if (codePointLength(value) > max) return PROBLEM_MSG.atMost(max);
  return undefined;
}

function validateProblemUrl(raw: string): string | undefined {
  const trimmed = raw.trim();
  const length = codePointLength(trimmed);
  if (length < 1) return PROBLEM_MSG.urlEmpty;
  if (length > PROBLEM_URL_MAX) return PROBLEM_MSG.urlTooLong;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return PROBLEM_MSG.urlInvalid;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    return PROBLEM_MSG.urlScheme;
  if (!parsed.hostname) return PROBLEM_MSG.urlInvalid;
  return undefined;
}

function validateTitle(raw: string): string | undefined {
  const trimmed = raw.trim();
  const length = codePointLength(trimmed);
  if (length < PROBLEM_TITLE_MIN) return PROBLEM_MSG.titleEmpty;
  if (length > PROBLEM_TITLE_MAX) return PROBLEM_MSG.titleTooLong;
  return undefined;
}

function validateRating(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (!/^-?\d+$/.test(trimmed)) return PROBLEM_MSG.ratingInvalid;
  const value = Number.parseInt(trimmed, 10);
  if (value < PROBLEM_RATING_MIN || value > PROBLEM_RATING_MAX) {
    return PROBLEM_MSG.ratingInvalid;
  }
  return undefined;
}

export function validateProblemDraft(values: {
  title: string;
  url: string;
  platformProblemId: string;
  difficulty: string;
  rating: string;
  notes: string;
}): FieldErrors {
  const out: FieldErrors = {};
  const titleErr = validateTitle(values.title);
  if (titleErr) out.title = titleErr;
  const urlErr = validateProblemUrl(values.url);
  if (urlErr) out.url = urlErr;

  const platform = values.platformProblemId.trim();
  if (platform) {
    const err = atMostCodePoints(platform, PROBLEM_PLATFORM_ID_MAX);
    if (err) out.platformProblemId = err;
  }
  const difficulty = values.difficulty.trim();
  if (difficulty) {
    const err = atMostCodePoints(difficulty, PROBLEM_DIFFICULTY_MAX);
    if (err) out.difficulty = err;
  }
  const notes = values.notes.trim();
  if (notes) {
    const err = atMostCodePoints(notes, PROBLEM_NOTES_MAX);
    if (err) out.notes = err;
  }
  const ratingErr = validateRating(values.rating);
  if (ratingErr) out.rating = ratingErr;

  return out;
}