import { ApiError } from "../api/errors";
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
      return "Check the highlighted fields and try again.";
    }
    return error.message || "Could not save your profile. Try again.";
  }
  return "Could not save your profile. Try again.";
}