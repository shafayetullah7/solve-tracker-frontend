import type { RequestEvent } from "@solidjs/web";

const REDACTED = "[redacted]";

/** Log SSR / request failures without cookies or auth bodies. */
export function logSsrRequestFailure(error: unknown, event?: RequestEvent): void {
  const req = event?.request;
  const method = req?.method ?? "?";
  let path = "?";
  if (req?.url) {
    try {
      path = new URL(req.url).pathname;
    } catch {
      path = REDACTED;
    }
  }
  const name = error instanceof Error ? error.name : "Error";
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "unknown failure";
  console.error(`[practice-ssr] ${method} ${path} ${name}: ${message}`);
}