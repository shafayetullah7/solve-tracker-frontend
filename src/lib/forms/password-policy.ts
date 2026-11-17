import { codePointLength } from "./unicode";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const PASSWORD_LENGTH_MESSAGE = `Password must contain ${PASSWORD_MIN}–${PASSWORD_MAX} characters`;

export function passwordCodePointLengthOk(value: string): boolean {
  const len = codePointLength(value);
  return len >= PASSWORD_MIN && len <= PASSWORD_MAX;
}

export function passwordLengthError(value: string): string | undefined {
  if (passwordCodePointLengthOk(value)) return undefined;
  return PASSWORD_LENGTH_MESSAGE;
}