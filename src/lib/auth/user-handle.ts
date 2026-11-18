import { codePointLength } from "../forms/unicode";

export const USER_HANDLE_MIN = 3;
export const USER_HANDLE_MAX = 24;

export const HANDLE_FIELD_HINT =
  "Optional. 3–24 letters, digits, or underscores; start and end with a letter or digit.";

export const HANDLE_FORMAT_MESSAGE =
  "Handle must use 3–24 letters, digits, or underscores, and start and end with a letter or digit";

const HANDLE_BODY = /^[a-zA-Z0-9_]+$/;
const HANDLE_EDGES = /^[a-zA-Z0-9].*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
const SYSTEM_U = /^u[a-f0-9]{23}$/;
const SYSTEM_R = /^r[a-z0-9]{22}$/;

export function formatHandleLabel(handle: string): string {
  return `@${handle}`;
}

export function isSystemAssignedHandle(handle: string): boolean {
  return SYSTEM_U.test(handle) || SYSTEM_R.test(handle);
}

export function validateUserHandle(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return HANDLE_FORMAT_MESSAGE;
  if (/\s/.test(trimmed)) return HANDLE_FORMAT_MESSAGE;
  const len = codePointLength(trimmed);
  if (len < USER_HANDLE_MIN || len > USER_HANDLE_MAX) return HANDLE_FORMAT_MESSAGE;
  if (!HANDLE_BODY.test(trimmed)) return HANDLE_FORMAT_MESSAGE;
  if (!HANDLE_EDGES.test(trimmed)) return HANDLE_FORMAT_MESSAGE;
  return undefined;
}

export const HANDLE_NUDGE_STORAGE_PREFIX = "practice.handle-nudge.dismissed:";

export function handleNudgeStorageKey(userId: string): string {
  return `${HANDLE_NUDGE_STORAGE_PREFIX}${userId}`;
}