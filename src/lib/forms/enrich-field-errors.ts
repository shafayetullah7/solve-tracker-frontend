import { ApiError } from "../api/errors";
import { authFormMessage } from "../auth/forms";
import { problemFormMessage } from "../problems/messages";
import { topicFormMessage } from "../topics/messages";
import type { FieldErrors } from "./field-errors";
import { mapApiFieldErrors } from "./map-api-field-errors";

/** Apply business-error field hints when details omit field keys. */
export function enrichFieldErrorsFromError(
  error: unknown,
  mapped: FieldErrors,
): FieldErrors {
  if (!(error instanceof ApiError)) return mapped;
  const out = { ...mapped };
  if (error.code === "EMAIL_IN_USE" && !out.email) {
    const msg = authFormMessage(error);
    if (msg.kind === "email_in_use") out.email = msg.message;
  }
  if (error.code === "PROBLEM_URL_IN_USE" && !out.url) {
    const banner = problemFormMessage(error);
    if (banner) out.url = banner;
  }
  if (error.code === "TOPIC_NAME_IN_USE" && !out.name) {
    const banner = topicFormMessage(error);
    if (banner) out.name = banner;
  }
  return out;
}

/** Full pipeline: `details` map + business enrichment. */
export function fieldErrorsFromApiError(error: unknown): FieldErrors {
  if (!(error instanceof ApiError)) return {};
  const mapped = mapApiFieldErrors(error.details);
  return enrichFieldErrorsFromError(error, mapped);
}