import { createSignal } from "solid-js";

const ownedWrite = { ownedWrite: true } as const;
import { applyAuthApiError } from "./apply-auth-api-error";
import { applyProblemApiError, applyTopicApiError } from "./apply-product-api-error";
import type { FieldErrors } from "./field-errors";
import { clearFieldError, type SetFieldErrors } from "./clear-field-error";
import { FORM_CLIENT_BANNER } from "./form-client-banner";
import type { FormBannerDomain } from "./resolve-form-banner";

export type FormStateDomain = FormBannerDomain;

export type CreateFormStateOptions = {
  problemExtras?: boolean;
};

export function createFormState(
  domain: FormStateDomain,
  options: CreateFormStateOptions = {},
) {
  const [pending, setPending] = createSignal(false, ownedWrite);
  const [fieldErrors, setFieldErrors] = createSignal<FieldErrors>({}, ownedWrite);
  const [formBanner, setFormBanner] = createSignal<string | undefined>(undefined, ownedWrite);
  const [retryAfter, setRetryAfter] = createSignal<string | undefined>(undefined, ownedWrite);
  const [submitAttempted, setSubmitAttempted] = createSignal(false, ownedWrite);
  const [existingProblemId, setExistingProblemId] = createSignal<string | undefined>(
    undefined,
    ownedWrite,
  );

  function resetErrors(): void {
    setFieldErrors({});
    setFormBanner(undefined);
    setRetryAfter(undefined);
    setExistingProblemId(undefined);
  }

  function clearField(fieldKey: string): void {
    clearFieldError(setFieldErrors as SetFieldErrors, fieldKey);
  }

  /** Clear banners before a successful client preflight → API attempt. */
  function beginSubmit(): void {
    setSubmitAttempted(true);
    setFormBanner(undefined);
    setFieldErrors({});
    setRetryAfter(undefined);
    setExistingProblemId(undefined);
  }

  function applyClientErrors(errors: FieldErrors): void {
    setSubmitAttempted(true);
    setFieldErrors({ ...errors });
    setFormBanner(FORM_CLIENT_BANNER);
    setRetryAfter(undefined);
    setExistingProblemId(undefined);
  }

  function applyApiError(error: unknown): void {
    if (domain === "auth") {
      const applied = applyAuthApiError(error);
      setFieldErrors({ ...applied.fieldErrors });
      setFormBanner(applied.banner);
      setRetryAfter(applied.retryAfter);
      return;
    }
    if (domain === "topic") {
      const applied = applyTopicApiError(error);
      setFieldErrors({ ...applied.fieldErrors });
      setFormBanner(applied.banner);
      setRetryAfter(applied.retryAfter);
      return;
    }
    const applied = applyProblemApiError(error);
    setFieldErrors({ ...applied.fieldErrors });
    setFormBanner(applied.banner);
    setRetryAfter(applied.retryAfter);
    if (options.problemExtras) {
      setExistingProblemId(applied.existingProblemId);
    }
  }

  return {
    pending,
    setPending,
    fieldErrors,
    setFieldErrors,
    formBanner,
    setFormBanner,
    retryAfter,
    setRetryAfter,
    submitAttempted,
    setSubmitAttempted,
    existingProblemId,
    setExistingProblemId,
    resetErrors,
    clearField,
    beginSubmit,
    applyClientErrors,
    applyApiError,
  };
}