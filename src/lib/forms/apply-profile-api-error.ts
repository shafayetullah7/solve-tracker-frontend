import { profileFormMessage } from "../profile/messages";
import { ProfileSaveError } from "../profile/profile-save-error";
import { ApiError } from "../api/errors";
import type { FieldErrors } from "./field-errors";
import { fieldErrorsFromApiError } from "./enrich-field-errors";
import { resolveFormBanner } from "./resolve-form-banner";

export function applyProfileApiError(error: unknown): {
  fieldErrors: FieldErrors;
  banner: string;
  retryAfter: string | undefined;
} {
  if (error instanceof ProfileSaveError) {
    return { fieldErrors: {}, banner: error.message, retryAfter: undefined };
  }
  const fieldErrors = fieldErrorsFromApiError(error);
  const banner =
    resolveFormBanner(error, fieldErrors, "profile") ?? profileFormMessage(error);
  const retryAfter = error instanceof ApiError ? error.retryAfter : undefined;
  return { fieldErrors, banner, retryAfter };
}