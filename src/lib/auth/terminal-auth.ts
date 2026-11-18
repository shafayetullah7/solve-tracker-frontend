import { ApiError } from "../api/errors";

const TERMINAL_AUTH_CODES = new Set([
  "AUTH_SESSION_INVALID",
  "AUTH_REFRESH_INVALID",
]);

/** Phase 0 terminal auth codes — stop recovery and clear local session UI. */
export function isTerminalAuthError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.kind !== "http" || error.status !== 401) return false;
  return typeof error.code === "string" && TERMINAL_AUTH_CODES.has(error.code);
}

export function shouldInvalidateProductSession(
  error: unknown,
  options: {
    afterFailedRecovery?: boolean;
    afterRecoveryRetry?: boolean;
  } = {},
): boolean {
  if (options.afterFailedRecovery) return true;
  if (!(error instanceof ApiError) || error.kind !== "http" || error.status !== 401)
    return false;
  if (options.afterRecoveryRetry) return true;
  return isTerminalAuthError(error);
}