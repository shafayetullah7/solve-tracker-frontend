import type { FieldErrors } from "./field-errors";
import { FORM_CLIENT_BANNER } from "./form-client-banner";
import { PASSWORD_LENGTH_MESSAGE, passwordLengthError } from "./password-policy";
import { codePointLength } from "./unicode";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_CLIENT_BANNER = FORM_CLIENT_BANNER;
export { FORM_CLIENT_BANNER };

export const AUTH_MSG = {
  nameLength: "Name must contain 1–100 characters",
  passwordLength: PASSWORD_LENGTH_MESSAGE,
  emailInvalid: "Invalid email",
  passwordRequired: "Password is required.",
  confirmMismatch: "Passwords do not match.",
} as const;

function validateEmailField(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return AUTH_MSG.emailInvalid;
  if (!EMAIL_PATTERN.test(trimmed)) return AUTH_MSG.emailInvalid;
  return undefined;
}

export function validatePasswordLength(password: string): string | undefined {
  return passwordLengthError(password);
}

export function validateLogin(values: { email: string; password: string }): FieldErrors {
  const out: FieldErrors = {};
  const emailErr = validateEmailField(values.email);
  if (emailErr) out.email = emailErr;
  if (!values.password) out.password = AUTH_MSG.passwordRequired;
  return out;
}

export function validateRegister(values: {
  name: string;
  email: string;
  password: string;
}): FieldErrors {
  const out: FieldErrors = {};
  const nameLen = codePointLength(values.name.trim());
  if (nameLen < 1 || nameLen > 100) out.name = AUTH_MSG.nameLength;
  const emailErr = validateEmailField(values.email);
  if (emailErr) out.email = emailErr;
  const pwdErr = validatePasswordLength(values.password);
  if (pwdErr) out.password = pwdErr;
  return out;
}

export function validateForgot(values: { email: string }): FieldErrors {
  const out: FieldErrors = {};
  const emailErr = validateEmailField(values.email);
  if (emailErr) out.email = emailErr;
  return out;
}

export function validateReset(values: {
  password: string;
  confirm: string;
}): FieldErrors {
  const out: FieldErrors = {};
  const pwdErr = validatePasswordLength(values.password);
  if (pwdErr) out.password = pwdErr;
  if (values.password !== values.confirm) out.confirm = AUTH_MSG.confirmMismatch;
  return out;
}