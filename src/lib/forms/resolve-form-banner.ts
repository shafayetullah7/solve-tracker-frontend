import { ApiError } from "../api/errors";
import { authFormMessage } from "../auth/forms";
import { problemFormMessage } from "../problems/messages";
import { topicFormMessage } from "../topics/messages";
import type { FieldErrors } from "./field-errors";

export type FormBannerDomain = "auth" | "problem" | "topic";

function domainMessage(error: ApiError, domain: FormBannerDomain): string {
  switch (domain) {
    case "auth":
      return authFormMessage(error).message;
    case "problem":
      return problemFormMessage(error);
    case "topic":
      return topicFormMessage(error);
  }
}

/**
 * Form-level banner copy when field errors do not carry the whole story.
 * Returns undefined when only fields should speak (e.g. mapped validation errors).
 */
export function resolveFormBanner(
  error: unknown,
  fieldErrors: FieldErrors,
  domain: FormBannerDomain,
): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  if (
    error.code === "VALIDATION_ERROR" &&
    Object.keys(fieldErrors).length > 0
  ) {
    return undefined;
  }
  return domainMessage(error, domain);
}