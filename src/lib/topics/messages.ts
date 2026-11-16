import { ApiError } from "../api/errors";
import type { FieldErrors } from "../forms/field-errors";
import { mapApiFieldErrors } from "../forms/map-api-field-errors";

export type { FieldErrors };

export function topicFieldErrors(details: unknown): FieldErrors {
  return mapApiFieldErrors(details);
}

export function topicFormMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "TOPIC_NAME_IN_USE")
      return "You already have a topic with that name.";
    if (error.code === "NOT_FOUND")
      return "Topic not found. Refresh the list.";
    if (error.code === "VALIDATION_ERROR")
      return error.message || "Check the highlighted fields.";
    if (error.code === "RATE_LIMITED")
      return error.message || "Too many attempts. Please wait and try again.";
    if (error.kind === "network" || error.kind === "timeout")
      return "The service is temporarily unavailable. Try again shortly.";
    if (error.kind === "http" && error.status !== undefined && error.status >= 500)
      return "The service is temporarily unavailable. Try again shortly.";
    if (error.message) return error.message;
  }
  return "Something went wrong. Try again.";
}