export function formFieldHintId(fieldId: string): string {
  return `${fieldId}-hint`;
}

export function formFieldErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

export type FormFieldControlAttrsOptions = {
  id: string;
  error?: string;
  hint?: string;
  extraDescribedBy?: string[];
  required?: boolean;
};

export type FormFieldControlAttrs = {
  id: string;
  "aria-invalid"?: "true";
  "aria-describedby"?: string;
  "aria-required"?: "true";
};

/** Accessibility attributes for a labeled form control inside {@link FormField}. */
export function formFieldControlAttrs(
  options: FormFieldControlAttrsOptions,
): FormFieldControlAttrs {
  const { id, error, hint, extraDescribedBy, required } = options;
  const hasError = Boolean(error && error.length > 0);
  const describedBy: string[] = [];
  if (hint) describedBy.push(formFieldHintId(id));
  if (extraDescribedBy?.length) describedBy.push(...extraDescribedBy);
  if (hasError) describedBy.push(formFieldErrorId(id));

  const attrs: FormFieldControlAttrs = { id };
  if (describedBy.length > 0) attrs["aria-describedby"] = describedBy.join(" ");
  if (hasError) attrs["aria-invalid"] = "true";
  if (required) attrs["aria-required"] = "true";
  return attrs;
}