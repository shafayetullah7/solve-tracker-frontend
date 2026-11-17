import { ApiError } from "../api/errors";
import { applyProfileApiError } from "../forms/apply-profile-api-error";
import { ProfileSaveError } from "./profile-save-error";

export function profileFormMessage(error: unknown): string {
  if (error instanceof ProfileSaveError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    if (error.code === "UNAUTHORIZED" || error.status === 401) {
      return "Your session expired. Sign in again to save changes.";
    }
    if (error.retryAfter) {
      return "Too many requests. Try again shortly.";
    }
    if (error.code === "VALIDATION_ERROR") {
      if (error.message === "Invalid entry id.") return error.message;
      if (error.message && error.message !== "Invalid input.") {
        return error.message;
      }
      return "Check the highlighted fields and try again.";
    }
    return error.message || "Could not save your profile. Try again.";
  }
  return "Could not save your profile. Try again.";
}

/** Banner when removing a work or education row from the profile list. */
export function profileEntryRemoveMessage(error: unknown): string {
  const { banner, fieldErrors } = applyProfileApiError(error);
  if (fieldErrors.id) return fieldErrors.id;
  if (banner) return banner;
  return "Could not remove this entry. Try again.";
}