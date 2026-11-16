import { ApiError } from "../api/errors";
import type { FieldErrors } from "./field-errors";
import { fieldErrorsFromApiError } from "./enrich-field-errors";
import { resolveFormBanner } from "./resolve-form-banner";

export function applyAuthApiError(error: unknown): {
  fieldErrors: FieldErrors;
  banner: string | undefined;
  retryAfter: string | undefined;
} {
  const fieldErrors = fieldErrorsFromApiError(error);
  const banner = resolveFormBanner(error, fieldErrors, "auth");
  const retryAfter =
    error instanceof ApiError ? error.retryAfter : undefined;
  return { fieldErrors, banner, retryAfter };
}