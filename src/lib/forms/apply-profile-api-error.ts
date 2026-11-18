import { profileFormMessage } from "../profile/messages";
import { ProfileSaveError } from "../profile/profile-save-error";
import { ApiError } from "../api/errors";
import type { FieldErrors } from "./field-errors";
import { fieldErrorsFromApiError } from "./enrich-field-errors";
import { resolveFormBanner } from "./resolve-form-banner";

export function applyProfileApiError(error: unknown): {
  fieldErrors: FieldErrors;
  banner: string | undefined;
  retryAfter: string | undefined;
} {
  if (error instanceof ProfileSaveError) {
    return { fieldErrors: {}, banner: error.message, retryAfter: undefined };
  }
  const fieldErrors = fieldErrorsFromApiError(error);
  const resolvedBanner = resolveFormBanner(error, fieldErrors, "profile");
  const fallbackBanner = profileFormMessage(error);
  const banner =
    resolvedBanner !== undefined
      ? resolvedBanner
      : Object.keys(fieldErrors).length > 0
        ? undefined
        : fallbackBanner;
  const retryAfter = error instanceof ApiError ? error.retryAfter : undefined;
  return { fieldErrors, banner, retryAfter };
}