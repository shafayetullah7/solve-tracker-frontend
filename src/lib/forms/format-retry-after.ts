/** Human-friendly wait hint from Retry-After (seconds) or similar string. */
export function formatRetryAfterHint(retryAfter?: string): string | undefined {
  if (retryAfter == null || retryAfter === "") return undefined;
  const seconds = Number.parseInt(retryAfter, 10);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}