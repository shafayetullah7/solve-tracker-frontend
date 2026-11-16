import { ApiError } from "../api/errors";
import type { FieldErrors } from "../forms/field-errors";
import { mapApiFieldErrors } from "../forms/map-api-field-errors";

export type { FieldErrors };

const EXISTING_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function problemFieldErrors(details: unknown): FieldErrors {
  return mapApiFieldErrors(details);
}

export function problemExistingIdFromError(error: unknown): string | undefined {
  if (!(error instanceof ApiError) || error.code !== "PROBLEM_URL_IN_USE") return undefined;
  if (typeof error.details !== "object" || error.details === null) return undefined;
  const value = (error.details as Record<string, unknown>).existingProblemId;
  if (typeof value !== "string" || !EXISTING_ID.test(value)) return undefined;
  return value;
}

function problemApiMessage(error: ApiError): string | undefined {
  if (error.code === "PROBLEM_URL_IN_USE")
    return "You already saved a problem with this URL.";
  if (error.code === "NOT_FOUND") return "Problem was not found. It may have been removed.";
  if (error.code === "VALIDATION_ERROR")
    return error.message || "Check the highlighted fields.";
  if (error.code === "RATE_LIMITED")
    return error.message || "Too many attempts. Please wait and try again.";
  if (error.kind === "network" || error.kind === "timeout")
    return "The service is temporarily unavailable. Try again shortly.";
  if (error.kind === "http" && error.status !== undefined && error.status >= 500)
    return "The service is temporarily unavailable. Try again shortly.";
  if (error.message) return error.message;
  return undefined;
}

/** List/load errors for the problem library. */
export function problemListMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "NOT_FOUND")
      return "That topic filter is not available. Try showing all problems.";
    const mapped = problemApiMessage(error);
    if (mapped) return mapped;
  }
  return "Something went wrong. Try again.";
}

export function problemFormMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const mapped = problemApiMessage(error);
    if (mapped) return mapped;
  }
  return "Something went wrong. Try again.";
}

/** Progress summary load errors (non-blocking on library/topics). */
export function progressMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const mapped = problemApiMessage(error);
    if (mapped) return mapped;
  }
  return "Could not load progress. Try again later.";
}