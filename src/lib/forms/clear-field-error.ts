import type { FieldErrors } from "./field-errors";

export type SetFieldErrors = (
  value: FieldErrors | ((previous: FieldErrors) => FieldErrors),
) => void;

/** Remove a single field key from form errors after the user edits that control. */
export function clearFieldError(setFieldErrors: SetFieldErrors, key: string): void {
  setFieldErrors((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}

export function onInputClearingField(
  setValue: (value: string) => void,
  setFieldErrors: SetFieldErrors,
  key: string,
): (event: { currentTarget: { value: string } }) => void {
  return (event) => {
    setValue(event.currentTarget.value);
    clearFieldError(setFieldErrors, key);
  };
}