import { ApiError } from "../api/errors";
import { problemExistingIdFromError } from "../problems/messages";
import type { FieldErrors } from "./field-errors";
import { fieldErrorsFromApiError } from "./enrich-field-errors";
import { resolveFormBanner } from "./resolve-form-banner";

export function applyProblemApiError(error: unknown): {
  fieldErrors: FieldErrors;
  banner: string | undefined;
  retryAfter: string | undefined;
  existingProblemId: string | undefined;
} {
  const fieldErrors = fieldErrorsFromApiError(error);
  const banner = resolveFormBanner(error, fieldErrors, "problem");
  const retryAfter =
    error instanceof ApiError ? error.retryAfter : undefined;
  const existingProblemId = problemExistingIdFromError(error);
  return { fieldErrors, banner, retryAfter, existingProblemId };
}

export function applyTopicApiError(error: unknown): {
  fieldErrors: FieldErrors;
  banner: string | undefined;
  retryAfter: string | undefined;
} {
  const fieldErrors = fieldErrorsFromApiError(error);
  const banner = resolveFormBanner(error, fieldErrors, "topic");
  const retryAfter =
    error instanceof ApiError ? error.retryAfter : undefined;
  return { fieldErrors, banner, retryAfter };
}